import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';
import { User } from './user';

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 80})
    @Length(10, 80)
    name: string;

    @Column({length: 100})
    @Length(10, 100)
    description: string;

    @CreateDateColumn()
    @Column('date')
    date: string;

    @ManyToOne(type => User, user => user.books)
    user: User;
}
