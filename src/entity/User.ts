import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable, OneToMany} from "typeorm";

@Entity()

export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(type => Tag, tag => tag.users)
    @JoinTable()
    tags: Tag[];
    
}

export class Product
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    price: number;



    @ManyToOne(type => ProductCategory, productcategory => productcategory.products)
    ProductCategory: ProductCategory;

   

}

export class Tag
{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string;

    @Column()
    color: string;

    @ManyToMany(type => User, user => user.tags)
    @JoinTable()
    users: User[];

}

export class ProductCategory
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    iconUrl: string;

    @OneToMany(type => Product, product => product.ProductCategory)
    products: Product[];
}