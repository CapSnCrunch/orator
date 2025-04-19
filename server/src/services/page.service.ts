import { firestore } from '../lib/firebase-admin.ts';
import { ImageService } from './image.service.ts';

export interface Page {
  bookId: string;
  imageUrl: string;
  pageContent: PageContent | null;
  createdAt: Date;
  updatedAt: Date;
  status: 'processing' | 'completed' | 'error';
}

/**
 * The content of a page, including the header, footer, body, page number,
 * and any error messages.
 */
export interface PageContent {
    header?: string | null;
    footer?: string | null;
    body?: string;
    page?: string | null;
    filename?: string;
    error?: string;
}

/**
 * Service for managing page data in Firestore
 */
export class PageService {
  
  private readonly collection = firestore.collection('pages');
  private readonly imageService: ImageService;

  constructor(imageService: ImageService) {
    this.imageService = imageService;
  }

  /**
   * Creates a page and initiates async analysis
   */
  async createPageAndAnalyze(
    bookId: string,
    imageFile: Express.Multer.File,
    imageUrl: string
  ): Promise<string> {

    // Create initial page
    const pageId = await this.savePage({
      bookId,
      imageUrl,
      pageContent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'processing'
    });

    // Kick off async analysis
    this.analyzePage(pageId, imageFile).catch(error => {
      console.error('Error in page analysis:', error);
    });

    // Return the page ID
    return pageId;
  }

  /**
   * Analyzes a page and saves the result to Firestore
   * @param pageId - The ID of the page to analyze
   * @param imageFile - The image file to analyze
   */
  private async analyzePage(pageId: string, imageFile: Express.Multer.File): Promise<void> {
    try {
      // Get OCR result
      const ocrResult = await this.imageService.analyzeImage(imageFile);
      
      // Update page with content
      await this.collection.doc(pageId).update({
        pageContent: ocrResult,
        status: 'completed',
        updatedAt: new Date()
      });
    } catch (error) {
      // Update page with error status
      await this.collection.doc(pageId).update({
        status: 'error',
        'pageContent.error': (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Saves OCR result to Firestore
   * @param imageUrl - The URL of the uploaded image
   * @param ocrResult - The OCR result to save
   * @returns The ID of the saved document
   */
  async savePage(page: Page) {
    const docRef = await this.collection.add(page);

    return docRef.id;
  }

  /**
   * Retrieves an OCR result from Firestore by ID
   * @param id - The ID of the OCR result to retrieve
   * @returns The OCR result or null if the document does not exist
   */
  async getPage(id: string) {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Retrieves all pages for a book
   * @param bookId - The ID of the book to retrieve pages for
   * @returns An array of pages or null if the book does not exist
   */
  async getPages(bookId: string) {
    const pages = await this.collection.where('bookId', '==', bookId).get();
    return pages.docs.map(doc => doc.data());
  } 
  
}