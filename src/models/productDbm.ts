import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ProductCategory } from './productCategoryDbm'
import { Tag } from './tagDbm'

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public name: string

  @Column()
  public description: string

  @Column()
  public price: number

  @ManyToOne(
    () => ProductCategory,
    (productCategory: ProductCategory) => productCategory.products
  )
  public productCategory: ProductCategory

  @ManyToMany(() => Tag, (tag: Tag) => tag.products)
  @JoinTable()
  public tags: Tag[]
}
