import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // Increased to 25MB limit
  },
});

app.use(cors());
app.use(express.json());

interface ScanRequest extends Request {
  file?: Express.Multer.File;
}

interface TTSRequest extends Request {
  body: {
    text: string;
    voice: string;
  }
}

interface ScanResponse {
  header?: string | null;
  footer?: string | null;
  body?: string;
  page?: string | null;
  filename?: string;
  error?: string;
}

interface TTSResponse {
  message?: string;
  path?: string;
  error?: string;
}

app.post('/api/scan', upload.single('image'), async (req: ScanRequest, res: Response<ScanResponse>): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');

    console.log(`Request received for file: ${req.file.originalname}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analyze this image and provide a JSON response with the following structure:
                {
                "header": "any content that is in the top part of the page like section title or null if there is none",
                "footer": "any content that is in the bottom part of the page or null if there is none",
                "body": "any other text content that is on the page, ignoring images",
                "page": "the page number if one is listed or null if there is none"
                }

                Please format your response as valid JSON only, with no additional text or code block indicators.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 2000,
    });

    if (response.usage) {
      console.log(`Tokens used: ${response?.usage.total_tokens}`);
    }
    console.log(`Response content: ${response.choices[0].message.content}`);

    const content = response.choices[0].message.content;
    if (content) {
      const parsedContent = JSON.parse(content);
      res.json({
        ...parsedContent,
        filename: req.file.originalname
      });
    } else {
      res.status(500).json({ error: 'No content returned from API' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: (error as Error).message || 'An error occurred during processing'
    });
  }
});

app.post('/api/tts', async (req: TTSRequest, res: Response<TTSResponse>): Promise<void> => {
  try {
    const { text, voice = 'nova' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'No text provided' });
      return;
    }

    // Available voices
    const availableVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse'];
    if (!availableVoices.includes(voice.toLowerCase())) {
      res.status(400).json({ error: 'Invalid voice option' });
      return;
    }

    // Send text to OpenAI TTS model
    const mp3 = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice.toLowerCase(),
      input: text,
      instructions: 'Speak in a cheerful and positive tone.',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filePath = path.resolve(`./server/audio/${Date.now()}.mp3`);
    await fs.promises.writeFile(filePath, buffer);

    res.json({ message: 'Audio file created', path: filePath });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: (error as Error).message || 'An error occurred during processing'
    });
  }
});

// Ensure the audio directory exists
fs.mkdirSync('./server/audio', { recursive: true });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 