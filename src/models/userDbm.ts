import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
// import { UserCm } from '../client_models/userCm'

import { Tag } from './tagDbm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number

 
  @ManyToMany(() => Tag, (tag: Tag) => tag.users)
  @JoinTable()
  public tags: Tag[]


}
