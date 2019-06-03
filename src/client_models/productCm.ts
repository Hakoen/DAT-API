import { ProductCategory } from "../models/productCategoryDbm";
import { Product } from "../models/productDbm";
import { Tag } from "../models/tagDbm";
import { ClientModel } from "./clientModel";

export class ProductCm extends ClientModel<Product> {

    static fromDbModel = (model: Product): ProductCm =>
        new ProductCm(model.id.toString(),
            model.name,
            model.description,
            model.productCategory,
            model.tags,
            model.price);

    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: ProductCategory;
    readonly tags: Tag[];
    readonly price: number;


    constructor(id: string, name: string, description: string, category: ProductCategory, tags: Tag[], price: number) {
        super();
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.tags = tags;
        this.price = price;
       
    }
}
