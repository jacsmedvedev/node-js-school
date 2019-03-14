import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { Book } from '../entity/book';

export default class BookController {

    public static async getBooks (ctx: BaseContext) {
        const bookRepository: Repository<Book> = getManager().getRepository(Book);
        const books: Book[] = await bookRepository.find();
        ctx.status = 200;
        ctx.body = books;
    }

    public static async getBook (ctx: BaseContext) {
        const bookRepository: Repository<Book> = getManager().getRepository(Book);
        const book: Book  = await bookRepository.findOne(+ctx.params.id || 0);
        if (!book) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to retrieve doesn\'t exist in the db';
            return;
        }
        ctx.status = 200;
        ctx.body = book;

    }

    public static async createBook  (ctx: BaseContext) {
        const bookRepository: Repository<Book > = getManager().getRepository(Book );
        const bookToBeSaved: Book = new Book();
        bookToBeSaved.name = ctx.request.body.name;
        bookToBeSaved.description = ctx.request.body.description;
        bookToBeSaved.date = ctx.request.body.date;
        const errors: ValidationError[] = await validate(bookToBeSaved); // errors is an array of validation errors
        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
        } else if ( await bookRepository.findOne({ description: bookToBeSaved.description}) ) {
            ctx.status = 400;
            ctx.body = 'The specified description already exists';
        } else {
            const book = await bookRepository.save(bookToBeSaved);
            ctx.status = 201;
            ctx.body = book;
        }
    }

    public static async updateBook (ctx: BaseContext) {
        const bookRepository: Repository<Book> = getManager().getRepository(Book);
        const bookToBeUpdated: Book = new Book();
        bookToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        bookToBeUpdated.name = ctx.request.body.name;
        bookToBeUpdated.description = ctx.request.body.description;
        bookToBeUpdated.date = ctx.request.body.date;


        const errors: ValidationError[] = await validate(bookToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
        } else if ( !await bookRepository.findOne(bookToBeUpdated.id) ) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to update doesn\'t exist in the db';
        } else if ( await bookRepository.findOne({ id: Not(Equal(bookToBeUpdated.id)) , description: bookToBeUpdated.description}) ) {
            ctx.status = 400;
            ctx.body = 'The specified description already exists';
        } else {
            const book = await bookRepository.save(bookToBeUpdated);
            ctx.status = 201;
            ctx.body = book;
        }
    }

    public static async deleteBook (ctx: BaseContext) {
        const bookRepository = getManager().getRepository(Book);
        const bookToRemove: Book = await bookRepository.findOne(+ctx.params.id || 0);
        if (!bookToRemove) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to delete doesn\'t exist in the db';
        } else if (+ctx.state.book.id !== bookToRemove.id) {
            ctx.status = 403;
            ctx.body = 'A user can only be deleted by himself';
        } else {
            await bookRepository.remove(bookToRemove);
            ctx.status = 204;
        }
    }
}
