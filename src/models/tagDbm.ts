import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Product } from "./productDbm"
import { User } from "./userDbm"

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    color: string;

    // FIXME: Do we need to know what users are associated with a single tag? If not, remove this and change to 1-many relation.
    // We don't need to know, but to link tags to multiple users we need this relation I guess.

    @ManyToMany(() => User, (user: User) => user.tags)
    users: User[];

    toString = (): string => this.name;

    @ManyToMany(type => Product, (product: Product) => product.tags)
    @JoinTable()
    products: Product[];

    // FIXME: Implement fromString method to go from tag-name to Tag instance from DB.
    //public fromString = (name: string): Tag => ...;

    //See tagCm

}