import { BaseContext } from 'koa';
import { getManager, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { Book } from '../entity/book';
import { User } from '../entity/user';


export default class BookController {

    public static async getUserBooks (ctx: BaseContext) {
        const userRepository: Repository<User> = getManager().getRepository(User);
        const user: User = await userRepository.findOne({
            where: {id: ctx.params.id},
            relations: ['books'],
        });
        ctx.status = 200;
        ctx.body = user.books;
    }

    public static async addBookToUser  (ctx: BaseContext) {
        const bookRepository: Repository<Book > = getManager().getRepository(Book);
        const bookToBeSaved: Book = new Book();
        bookToBeSaved.name = ctx.request.body.name;
        bookToBeSaved.description = ctx.request.body.description;
        bookToBeSaved.date = new Date().toLocaleDateString();

        const userRepository: Repository<User> = getManager().getRepository(User);
        const user: User = await userRepository.findOne(ctx.params.id);
        bookToBeSaved.user = user;
        const errors: ValidationError[] = await validate(bookToBeSaved); // errors is an array of validation errors
        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
        } else if ( await bookRepository.findOne({ name: bookToBeSaved.name}) ) {
            ctx.status = 400;
            ctx.body = 'The book with this name already exists !';
        } else {
            const book = await bookRepository.save(bookToBeSaved);
            ctx.status = 201;
            ctx.body = book;
        }
    }

    public static async updateUserBook (ctx: BaseContext) {
        const bookRepository: Repository<Book> = getManager().getRepository(Book);
        const bookToBeUpdated: Book = await bookRepository.findOne(+ctx.params.bookid || 0);
        bookToBeUpdated.name = ctx.request.body.name;
        bookToBeUpdated.description = ctx.request.body.description;

        const errors: ValidationError[] = await validate(bookToBeUpdated); // errors is an array of validation errors

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
        } else if ( !await bookRepository.findOne(+ctx.params.bookid || 0) ) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to update doesn\'t exist in the db';
        } else {
            const book = await bookRepository.save(bookToBeUpdated);
            ctx.status = 201;
            ctx.body = book;
        }
    }

    public static async deleteBookFronUser (ctx: BaseContext) {
        const bookRepository = getManager().getRepository(Book);
        const bookToRemove: Book = await bookRepository.findOne(+ctx.params.bookid || 0);
        if (!bookToRemove) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to delete doesn\'t exist in the db';
        } else {
            await bookRepository.remove(bookToRemove);
            ctx.status = 204;
            ctx.body = 'Book with ID ' + bookToRemove.id + 'has been deleted.';
        }
    }
}
