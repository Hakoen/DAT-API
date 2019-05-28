import { Product } from "../entities";
import { ClientModel } from "./clientModel";

export class ProductCm extends ClientModel<Product> {
	// TODO: Implement other fields;

	public static fromDbModel = (model: Product): ProductCm =>
		new ProductCm(model.id.toString());

	public readonly id: string;

	constructor(id: string) {
		super();
		this.id = id;
		// TODO: Implement other fields;
	}
}
