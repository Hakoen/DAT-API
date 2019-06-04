import { ProductCategory } from '../models/productCategoryDbm'
import { Product } from '../models/productDbm'
import { Tag } from '../models/tagDbm'
import { ClientModel } from './clientModel'

export class ProductCm extends ClientModel<Product> {
  public static fromDbModel = (model: Product): ProductCm =>
    new ProductCm(
      model.id.toString(),
      model.name,
      model.description,
      model.productCategory,
      model.tags,
      model.price
    )

  public readonly id: string
  public readonly name: string
  public readonly description: string
  public readonly category: ProductCategory
  public readonly tags: Tag[]
  public readonly price: number

  constructor(
    id: string,
    name: string,
    description: string,
    category: ProductCategory,
    tags: Tag[],
    price: number
  ) {
    super()
    this.id = id
    this.name = name
    this.description = description
    this.category = category
    this.tags = tags
    this.price = price
  }
}
