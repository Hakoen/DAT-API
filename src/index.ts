import "reflect-metadata";
import { createConnection } from "typeorm";
import express, { Request, Response } from "express";
import { Product } from "./Entities";
// import { User, Tag } from "./entity/User";

const app = express();
const port = 8080;

createConnection()
	.then(async connection => {
		await connection.synchronize();
		app.listen(port, () => {
			// tslint:disable-next-line:no-console
			console.log(`server is running on: http://localhost:${port}`);
		});

		app.get("/user", async (req: Request, res: Response) => {
			let firstUser: Product = null;
			try {
				firstUser = await connection
					.getRepository(Product)
					.createQueryBuilder("product")
					.where("product.id = :id", { id: 2 })
					.getOne();
			} catch (error) {
				console.log(error);
			}
			res.send(firstUser);
		});
	})
	.catch(error => console.log(error));
