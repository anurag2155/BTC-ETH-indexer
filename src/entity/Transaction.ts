import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Block } from "./Block";

@Entity()
export class Transaction {
    @PrimaryColumn()
    chain!: string; // 'eth' or 'btc'

    @PrimaryColumn()
    hash!: string;

    @Column()
    from!: string;

    @Column({ nullable: true })
    to!: string;

    @Column("varchar")
    value!: string;

    @Column()
    blockNumber!: number;

    @Column()
    blockChain!: string;

    @ManyToOne(() => Block, (block) => block.transactions)
    @JoinColumn([
        { name: "blockChain", referencedColumnName: "chain" },
        { name: "blockNumber", referencedColumnName: "number" }
    ])
    block!: Block;

    @CreateDateColumn()
    createdAt!: Date;
}
