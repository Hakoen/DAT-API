import { User, Product, Tag } from "../models/";
import { ProductCm, ClientModel } from '../client_models'

 export class UserCm extends ClientModel<User> {

     //static fromDbModel = (model: User): UserCm =>
     //    new UserCm(
     //        model.id.toString(),
     //        model.id.
     //        TODO: userBackEnd to userFrontEnd
     //        );

     readonly id: string;
     readonly recommendedProducts: ProductCm[];

     constructor(id: string, recommendedProducts: ProductCm[]) {
         super();
         this.id = id;
         this.recommendedProducts = recommendedProducts;
     }

    //Tags -> Recommended products.

 }
