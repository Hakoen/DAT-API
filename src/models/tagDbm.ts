import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Product } from './productDbm'
import { User } from './userDbm'

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public name: string

  @Column()
  public color: string

  // FIXME: Do we need to know what users are associated with a single tag? If not, remove this and change to 1-many relation.
  // We don't need to know, but to link tags to multiple users we need this relation I guess.

  @ManyToMany(() => User, (user: User) => user.tags)
  public users: User[]

  @ManyToMany((type) => Product, (product: Product) => product.tags)
  @JoinTable()
  public products: Product[]

  public toString = (): string => this.name

  // FIXME: Implement fromString method to go from tag-name to Tag instance from DB.
  // public fromString = (name: string): Tag => ...;

  // See tagCm
}
