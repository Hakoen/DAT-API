import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from 'typeorm'
// import { UserCm } from '../client_models/userCm'

import { Tag } from './tagDbm'

@Entity()
export class UserTag {
  @PrimaryColumn()
  public userId: string

  @PrimaryColumn()
  public tagId: number

  @Column()
  public counter: number
}
