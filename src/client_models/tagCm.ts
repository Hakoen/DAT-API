import { Tag } from '../models/tagDbm'
import { ClientModel } from './clientModel'
import { ProductCm } from './productCm'

export class TagCm extends ClientModel<Tag> {
  public static fromDbModel = (model: Tag): TagCm =>
    new TagCm(model.id.toString(), model.name, model.color)

  public readonly id: string
  public readonly name: string
  public readonly color: string

  constructor(id: string, name: string, color: string) {
    super()
    this.id = id
    this.name = name
    this.color = color
  }
}
