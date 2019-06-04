import { ProductCategory, Product, Tag } from '../models/';

export class AllModel {

public static toAllModel = (pcmodel: ProductCategory[], pmodel: Product[], tmodel: Tag[]): AllModel =>
        new AllModel(
          pcmodel,
          tmodel,
          pmodel
        )

    public readonly categories: ProductCategory[]
    public readonly tags: Tag[]
    public readonly products: Product[]

    constructor(
        categories: ProductCategory[],
        tags: Tag[],
        products: Product[]
        )
        {
            this.categories = categories
            this.tags = tags
            this.products = products
        }

}