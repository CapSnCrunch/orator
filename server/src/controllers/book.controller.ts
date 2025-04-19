import { BookService } from '../services/book.service.ts';
import { PageService } from '../services/page.service.ts';
import { ImageService } from '../services/image.service.ts';
import { Router } from 'express';
import express from 'express';
import multer from 'multer';

// Create book resquest / response
export interface CreateBookRequest {
  body: {
    title: string;
    author: string;
  }
}
export interface CreateBookResponse {
  id: string | null;
  error?: string;
}

// Create page request / response
export interface CreatePageRequest {
  file?: Express.Multer.File;
}
export interface CreatePageResponse {
  id: string | null;
  error?: string;
}

export class BookController {
  private bookService: BookService;
  private pageService: PageService;
  private imageService: ImageService;

  constructor(
    bookService: BookService,
    pageService: PageService,
    imageService: ImageService,
  ) {
    this.bookService = bookService;
    this.pageService = pageService;
    this.imageService = imageService;
  }

  /**
   * Register all book-related routes
   * @param router - Express Router instance
   * @param upload - Multer middleware instance
   */
  registerRoutes(router: Router, upload: multer.Multer): void {
    // Create a new book without any pages to setup a sort of "folder"
    // to upload pages into.
    router.post('/books', 
      async (req: express.Request<CreateBookRequest>, res: express.Response<CreateBookResponse>) => {
      try {
        // TODO: Validate the user is authenticated

        const bookId = await this.bookService.createBook(req.body);
        res.status(201).json({ id: bookId });
      } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
          id: null,
          error: (error as Error).message || 'An error occurred while creating the book',
        });
      }
    });
    
    // Get a books high level details like title, author, etc.
    // (does not include any page information)
    router.get('/books/:bookId', async (req: express.Request, res: express.Response) => {
      try {
        // TODO: Validate the user is authenticated
        // TODO: Validate visibility of the book (users can only access their own books)

        const book = await this.bookService.getBook(req.params.bookId);
        if (book === null || book === undefined) {
          res.status(404).json({ error: 'Book not found' });
          return;
        }
        res.json(book);
      } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
          error: (error as Error).message || 'An error occurred while fetching the book'
        });
      }
    });

    // Create a new page, with (for a time) synchoronous image processing (OCR)
    // and associate it with the given book.
    router.post('/books/:bookId/pages',
      upload.single('image'),
      async (req: express.Request<{bookId: string}, any, CreatePageRequest>, res: express.Response<CreatePageResponse>) => {
        try {
          if (!req.file) {
            res.status(400).json({
              id: null,
              error: 'No image file provided',
            });
            return;
          }

          // TODO: Validate the user is authenticated
          // TODO: Validate visibility of the book (users can only access their own books)
    
          // Validate the book exists
          const bookId = req.params.bookId;
          const book = await this.bookService.getBook(bookId);
          if (book === null || book === undefined) {
            res.status(404).json({
              id: null,
              error: 'Book not found',
            });
            return;
          }

          // Upload image to storage
          const imageUrl = await this.imageService.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
          );
    
          // Create the page and kick off async analysis
          // By just passing in an image URL, we can later allow people to upload
          // images from other sources (and not have to include it in the request)
          const pageId = await this.pageService.createPageAndAnalyze(
            bookId,
            req.file,
            imageUrl
          );
    
          res.status(201).json({
            id: pageId,
          });
        } catch (error) {
          console.error('Error creating page:', error);
          res.status(500).json({
            id: null,
            error: (error as Error).message || 'An error occurred while creating the page'
          });
        }
      }
    );

    // Get all the page details for a book (we might consider having explicitly
    // limited pagination request params like firstPageNumber and lastPageNumber)
    router.get('/books/:bookId/pages', async (req: express.Request, res: express.Response) => {
      try {
        // TODO: Validate the user is authenticated
        // TODO: Validate visibility of the book (users can only access their own books)

        const pages = await this.pageService.getPages(req.params.bookId);
        res.json(pages);
      } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({
          error: (error as Error).message || 'An error occurred while fetching the pages'
        });
      }
    });
  }
} 