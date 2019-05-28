import { User } from "../entities";
import { ClientModel } from "./clientModel";
import { ProductCm } from "./productCm";

export class UserCm extends ClientModel<User> {

	public readonly id: string;
	public readonly recommendedProducts: ProductCm[];
	constructor(id: string, recommendedProducts: ProductCm[]) {
		super();
		this.id = id;
		this.recommendedProducts = recommendedProducts;
	}

	// static fromDbModel(model: User): UserCm {
	// 	return model.toClientModel();
	// }

	// FIXME: Check if toJson needs to implemented.

}
