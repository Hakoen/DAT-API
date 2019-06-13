import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm'
import { Product, UserTag } from '../models'

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public name: string

  @Column()
  public color: string

  @ManyToMany((type) => Product, (product: Product) => product.tags)
  @JoinTable()
  public products: Product[]

  public toString = (): string => this.name

  @OneToMany(() => UserTag, (usertag: UserTag) => usertag.user)
  userTags: UserTag[];

}
