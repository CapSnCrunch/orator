import { firestore } from '../lib/firebase-admin.ts';

export interface Page {
  bookId: string;
  imageUrl: string;
  pageContent: PageContent;
  createdAt: Date;
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