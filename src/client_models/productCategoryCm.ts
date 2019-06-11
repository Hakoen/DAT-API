import { Product, ProductCategory, Tag, UserTag } from '../models/'
import { ClientModel } from './clientModel'

export class ProductCategoryCm extends ClientModel<ProductCategory> {
  public static fromDbModel = (model: ProductCategory): ProductCategoryCm =>
    new ProductCategoryCm(
      model.id.toString(),
      model.name,
      model.description,
      model.iconUrl,
      model.products
    )

  public readonly id: string
  public readonly name: string
  public readonly description: string
  public readonly iconUrl: string
  public readonly products: Product[]

  constructor(
    id: string,
    name: string,
    description: string,
    iconUrl: string,
    products: Product[]
  ) {
    super()
    this.id = id
    this.name = name
    this.description = description
    this.iconUrl = iconUrl
    this.products = products
  }
}
