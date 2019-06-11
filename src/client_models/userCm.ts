import { ClientModel, ProductCm } from '../client_models'
import { Product, Tag, UserTag } from '../models/'

export class UserCm extends ClientModel<UserTag> {
  // static fromDbModel = (model: User): UserCm =>
  //    new UserCm(
  //        model.id.toString(),
  //        model.id.
  //        TODO: userBackEnd to userFrontEnd
  //        );

  public readonly id: string
  public readonly recommendedProducts: ProductCm[]

  constructor(id: string, recommendedProducts: ProductCm[]) {
    super()
    this.id = id
    this.recommendedProducts = recommendedProducts
  }

  // Tags -> Recommended products.
}
