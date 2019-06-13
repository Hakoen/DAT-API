import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm'
import { Product, User } from '../models'

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

    @ManyToMany(() => User, (user: User) => user.tags)
    @JoinTable()
    public users: User[]
}
