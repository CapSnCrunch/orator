import { firestore } from '../lib/firebase-admin.ts';

export interface Book {
  title: string;
  author: string;
}

export class BookService {
  private readonly bookCollection = firestore.collection('books');

  /**
   * Creates a new book in the database
   * @param book - The book to create
   * @returns The ID of the created book
   */
  async createBook(bookData: Book): Promise<string> {
    const docRef = await this.bookCollection.add(bookData);
    return docRef.id;
  }

  /**
   * Retrieves a book from the database by ID
   * @param id - The ID of the book to retrieve
   * @returns The book or null if it does not exist
   */
  async getBook(id: string): Promise<Book | null> {
    const doc = await this.bookCollection.doc(id).get();
    return doc.exists ? doc.data() as Book : null;
  }
}
