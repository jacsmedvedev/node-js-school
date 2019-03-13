import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { Book } from '../entity/book';

export default class BookController {

    public static async getBooks (ctx: BaseContext) {

        // get a book repository to perform operations with book
        const bookRepository: Repository<Book> = getManager().getRepository(Book);

        // load all books
        const books: Book[] = await bookRepository.find();

        // return OK status code and loaded books array
        ctx.status = 200;
        ctx.body = books;
    }

    public static async getBook (ctx: BaseContext) {

        // get a book repository to perform operations with books
        const bookRepository: Repository<Book> = getManager().getRepository(Book);

        // load user by id
        const book: Book  = await bookRepository.findOne(+ctx.params.id || 0);

        if (!book) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to retrieve doesn\'t exist in the db';
            return;
        }

        // return OK status code and loaded book object
        ctx.status = 200;
        ctx.body = book;

    }

    public static async createBook  (ctx: BaseContext) {

        // get a Book repository to perform operations with Book
        const bookRepository: Repository<Book > = getManager().getRepository(Book );

        // build up entity Book to be saved
        const bookToBeSaved: Book = new Book();
        bookToBeSaved.name = ctx.request.body.name;
        bookToBeSaved.description = ctx.request.body.description;
        bookToBeSaved.date = ctx.request.body.date;

        // validate Book entity
        const errors: ValidationError[] = await validate(bookToBeSaved); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if ( await bookRepository.findOne({ description: bookToBeSaved.description}) ) {
            // return BAD REQUEST status code and description already exists error
            ctx.status = 400;
            ctx.body = 'The specified description already exists';
        } else {
            // save the Book contained in the POST body
            const book = await bookRepository.save(bookToBeSaved);
            // return CREATED status code and updated Book
            ctx.status = 201;
            ctx.body = book;
        }
    }

    public static async updateBook (ctx: BaseContext) {

        // get a Book repository to perform operations with user
        const bookRepository: Repository<Book> = getManager().getRepository(Book);

        // update the Book by specified id
        // build up entity Book to be updated
        const bookToBeUpdated: Book = new Book();
        bookToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        bookToBeUpdated.name = ctx.request.body.name;
        bookToBeUpdated.description = ctx.request.body.description;
        bookToBeUpdated.date = ctx.request.body.date;


        // validate book entity
        const errors: ValidationError[] = await validate(bookToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else if ( !await bookRepository.findOne(bookToBeUpdated.id) ) {
            // check if a user with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The book you are trying to update doesn\'t exist in the db';
        } else if ( await bookRepository.findOne({ id: Not(Equal(bookToBeUpdated.id)) , description: bookToBeUpdated.description}) ) {
            // return BAD REQUEST status code and description already exists error
            ctx.status = 400;
            ctx.body = 'The specified description already exists';
        } else {
            // save the user contained in the PUT body
            const book = await bookRepository.save(bookToBeUpdated);
            // return CREATED status code and updated user
            ctx.status = 201;
            ctx.body = book;
        }
    }

    public static async deleteBook (ctx: BaseContext) {

        // get a book repository to perform operations with user
        const bookRepository = getManager().getRepository(Book);

        // find the book by specified id
        const bookToRemove: Book = await bookRepository.findOne(+ctx.params.id || 0);
        if (!bookToRemove) {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = 'The book you are trying to delete doesn\'t exist in the db';
        } else if (+ctx.state.book.id !== bookToRemove.id) {
            // check user's token id and user id are the same
            // if not, return a FORBIDDEN status code and error message
            ctx.status = 403;
            ctx.body = 'A user can only be deleted by himself';
        } else {
            // the book is there so can be removed
            await bookRepository.remove(bookToRemove);
            // return a NO CONTENT status code
            ctx.status = 204;
        }
    }
}
