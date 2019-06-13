import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm'
import { User, Tag} from './index'




@Entity()
export class UserTag {


    @ManyToOne(() => User, (user: User) => user.id )
    user: User;

    @ManyToOne(() => Tag, (tag: Tag) => tag.id)
    tag: Tag;

    count: number;
    


}