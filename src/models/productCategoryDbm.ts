import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";

import { Product } from "./productDbm"


@Entity()
export class ProductCategory {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    iconUrl: string;

    @OneToMany(() => Product, (product: Product) => product.productCategory)
    products: Product[];
}