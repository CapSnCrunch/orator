import { storage, firestore } from '../lib/firebase-admin.ts';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OcrResult {
  header?: string | null;
  footer?: string | null;
  body?: string;
  page?: string | null;
  filename?: string;
  error?: string;
}

export class ImageService {
  private readonly collection = firestore.collection('pages');

  /**
   * Uploads an image to Firebase Storage and returns a signed URL
   * @param file - The image file to upload
   * @param fileName - The name of the file to save
   * @param contentType - The MIME type of the file
   * @returns A signed URL for the uploaded image
   */
  async uploadImage(file: Buffer, fileName: string, contentType: string) {
    const bucket = storage.bucket();
    const fileUpload = bucket.file(`ocr-uploads/${fileName}`);
    
    await fileUpload.save(file, {
      metadata: { contentType }
    });

    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    return url;
  }

  /**
   * Analyzes an image using OpenAI's vision model
   * @param file - The image file to analyze
   * @returns The OCR result
   */
  async analyzeImage(file: Express.Multer.File): Promise<OcrResult> {
    try {
      const base64Image = file.buffer.toString('base64');
      console.log(`Processing image: ${file.originalname}`);

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
                  url: `data:${file.mimetype};base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 2000,
      });

      if (response.usage) {
        console.log(`Tokens used: ${response.usage.total_tokens}`);
      }
      console.log(`Response content: ${response.choices[0].message.content}`);

      const content = response.choices[0].message.content;
      if (content) {
        const parsedContent = JSON.parse(content);
        return {
          ...parsedContent,
          filename: file.originalname
        };
      } else {
        throw new Error('No content returned from API');
      }
    } catch (error) {
      console.error('Error in OCR service:', error);
      throw error;
    }
  }
} 