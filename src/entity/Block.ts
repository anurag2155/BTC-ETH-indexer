import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Transaction } from "./Transaction";

@Entity()
export class Block {
    @PrimaryColumn()
    chain!: string; // 'eth' or 'btc'

    @PrimaryColumn()
    number!: number;

    @Column()
    hash!: string;

    @Column()
    parentHash!: string;

    @Column("bigint")
    timestamp!: string;

    @OneToMany(() => Transaction, (transaction) => transaction.block)
    transactions!: Transaction[];

    @CreateDateColumn()
    createdAt!: Date;
}
