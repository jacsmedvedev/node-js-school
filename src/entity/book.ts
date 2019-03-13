import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity()
export class Book {

    @Column({length: 80})
    @Length(10, 80)
    name: string;

    @Column({length: 100})
    @Length(10, 100)
    description: string;

    @Column({length: 100})
    @Length(10, 100)
    date: 'date';
}
