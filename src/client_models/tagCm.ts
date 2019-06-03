import { Tag } from "../models/tagDbm";
import { ClientModel } from "./clientModel";
import { ProductCm } from "./productCm";

export class TagCm extends ClientModel<Tag> {

    static fromDbModel = (model: Tag): TagCm =>
        new TagCm(
            model.id.toString(),
            model.name,
            model.color,
            );

    readonly id: string;
    readonly name: string;
    readonly color: string;

    constructor(id: string, name: string, color: string) {
        super();
        this.id = id;
        this.name = name;
        this.color = color;
    }

}