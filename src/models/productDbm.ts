import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable
} from "typeorm";
import { Tag } from "./tagDbm"
import { ProductCategory } from "./productCategoryDbm"


@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @ManyToOne(
        () => ProductCategory,
        (productCategory: ProductCategory) => productCategory.products
    )
    productCategory: ProductCategory;

    @ManyToMany(() => Tag, (tag: Tag) => tag.products)
    @JoinTable()
    tags: Tag[];
}
