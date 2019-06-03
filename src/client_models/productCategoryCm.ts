import { ProductCategory } from "../models/productCategoryDbm";
import { Product } from "../models/productDbm";
import { Tag } from "../models/tagDbm";
import { ClientModel } from "./clientModel";

export class ProductCategoryCm extends ClientModel<ProductCategory> {

    static fromDbModel = (model: ProductCategory): ProductCategoryCm =>
        new ProductCategoryCm(
            model.id.toString(),
            model.name,
            model.description,
            model.iconUrl,
            model.products
        );

    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly iconUrl: string;
    readonly products: Product[];


    constructor(id: string, name: string, description: string, iconUrl: string, products: Product[]) {
        super();
        this.id = id;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.products = products;

    }
}