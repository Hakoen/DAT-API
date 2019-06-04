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

  // FIXME: See Tag.users
  // @ManyToMany(() => Tag, (tag: Tag) => tag.users)
  // @JoinTable()
  // public tags: Tag[]

  //   public async convertToClient(user: User /*, userClient: UserCm */) {

  //     // return userClient;
  //     return
  // }
  // FIXME: Consider using map<tagname, number_of_times_ordered> instead of list of tags:
  // NEED HELP:(

  // tags: { [key: string]: number }; // Use immutable.Map if possible.

  //  Example: {'vegan', 20, 'milkshake': 2}
}
