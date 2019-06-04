import { Product, ProductCategory, Tag } from '../models/'
import { ProductForClient } from '../models/productForClient'

export class AllModel {
  public static toAllModel = (
    pcmodel: ProductCategory[],
    pmodel: ProductForClient[],
    tmodel: Tag[]
  ): AllModel => new AllModel(pcmodel, tmodel, pmodel)

  public readonly categories: ProductCategory[]
  public readonly tags: Tag[]
  public readonly products: ProductForClient[]

  constructor(
    categories: ProductCategory[],
    tags: Tag[],
    products: ProductForClient[]
  ) {
    this.categories = categories
    this.tags = tags
    this.products = products
  }
}
