import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import cors from 'cors';

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

app.post('/api/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
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

    console.log(`Tokens used: ${response.usage.total_tokens}`);
    console.log(`Response content: ${response.choices[0].message.content}`);

    // Parse the response content as JSON
    const parsedContent = JSON.parse(response.choices[0].message.content);
    res.json({
      ...parsedContent,
      filename: req.file.originalname
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during processing'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 