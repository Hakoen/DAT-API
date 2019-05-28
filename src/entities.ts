import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from "typeorm";
import { UserCm } from "./client_models/userCm";
import { DatabaseModel } from "./models/databaseModel";

// TODO:
//  1. Move models to ./models folder, 1 class per file.
//  2. Add DatabaseModel<...> to all entities (and include methods)
//  3. Add all client models based on diagram in technical report.

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	public id: number;

	// FIXME: See Tag.users
	@ManyToMany(() => Tag, tag => tag.users)
	@JoinTable()
	public tags: Tag[];

	// FIXME: Consider using map<tagname, number_of_times_ordered> instead of list of tags:
	// tags: { [key: string]: number }; // Use immutable.Map if possible.

	//  Example: {'vegan', 20, 'milkshake': 2}
}

@Entity()
export class Product {
	// TODO: Add DatabaseModel<ProductCm>
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public name: string;

	@Column()
	public description: string;

	@Column()
	public price: number;

	@ManyToOne(
		() => ProductCategory,
		(productcategory) => productcategory.products
	)
	public ProductCategory: ProductCategory;
}

@Entity()
export class Tag {
	// TODO: Add DatabaseModel<TagCm>
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public name: string;

	@Column()
	public color: string;

	// FIXME: Do we need to know what users are associated with a single tag? If not, remove this and change to 1-many relation.
	@ManyToMany(type => User, user => user.tags)
	@JoinTable()
	public users: User[];

	public toString = (): string => this.name;

	// FIXME: Implement fromString method to go from tag-name to Tag instance from DB.
	//  public fromString = (name: string): Tag => ...;
}

@Entity()
export class ProductCategory {
	// TODO: Add DatabaseModel<ProductCategory>
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public name: string;

	@Column()
	public description: string;

	@Column()
	public iconUrl: string;

	@OneToMany(type => Product, product => product.ProductCategory)
	public products: Product[];
}
