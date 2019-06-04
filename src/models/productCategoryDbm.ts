import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Product } from './productDbm'

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public name: string

  @Column()
  public description: string

  @Column()
  public iconUrl: string

  @OneToMany(() => Product, (product: Product) => product.productCategory)
  public products: Product[]
}
