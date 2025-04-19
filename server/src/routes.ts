import { Router } from 'express';
import multer from 'multer';
import type { Request, Response } from 'express';
import { ImageService } from './services/image.service.ts';
import { TtsService } from './services/tts.service.ts'; 
import { PageService } from './services/page.service.ts';
import { BookController } from './controllers/book.controller.ts';
import { BookService } from './services/book.service.ts';

const router = Router();
const imageService = new ImageService();
const ttsService = new TtsService();
const pageService = new PageService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

// Initialize services and controller
const bookService = new BookService();
const bookController = new BookController(bookService, pageService, imageService);

// Book routes
bookController.registerRoutes(router, upload);

// These TTS routes will also probably go in the book controller
// Other controllers for the api might include other account management 
// routes, payments, etc.

interface TTSRequest extends Request {
    body: {
      text: string;
      voice: string;
    }
}
  
interface TTSResponse {
    message?: string;
    path?: string;
    error?: string;
  }

router.post('/tts', async (req: TTSRequest, res: Response<TTSResponse>): Promise<void> => {
    try {
      const { text, voice = 'nova' } = req.body;
      if (!text) {
        res.status(400).json({ error: 'No text provided' });
        return;
      }
  
      // Generate audio file
      const audioBuffer = await ttsService.generateAudio(text, voice);
      
      // Save audio file to Firebase Storage
      const fileName = `${Date.now()}.mp3`;
      const audioUrl = await ttsService.saveAudioFile(audioBuffer, fileName);
      
      // Save TTS result to Firestore
      await ttsService.saveTtsResult(text, audioUrl);
  
      res.json({ 
        message: 'Audio file created', 
        path: audioUrl 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        error: (error as Error).message || 'An error occurred during processing'
      });
    }
  });

export default router;