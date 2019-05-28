import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import "reflect-metadata";
import {
	Connection,
	createConnection,
	getConnection,
	getCustomRepository,
	getManager,
} from "typeorm";
import { ProductCm, UserCm } from "./client_models";
import { ClientModel } from "./client_models/clientModel";
import { Product, Tag, User } from "./Entities";
import { getProducts } from "./services";
import { isOrder } from "./validation/order";

const app = express();
const port = 8080;

createConnection()
	.then((connection) => {
		const usersRepo = connection.getRepository(User);
		const tagRepo = connection.getRepository(Tag);

		app.use(bodyParser.json());
		// app.use(cors())

		app.listen(port, () => {
			console.log(`server is running on: http://localhost:${port}`);
		});

		app.post("/place_order", (req: Request, res: Response) => {
			res.send(isOrder(req.body));
		});

		app.post("/tag", (req: Request, res: Response) => {
			const newTag = tagRepo.create({
				name: req.body.name,
				color: req.body.color,
			});

			tagRepo
				.save(newTag)
				.then(() => {
					res.sendStatus(201);
				})
				.catch((err) => {
					console.log(err);
					res.sendStatus(501);
				});
		});

		app.delete("/tag", (req: Request, res: Response) => {
			tagRepo
				.findOne({ name: req.body.name })
				.then((deleteTag) => {
					tagRepo.delete(deleteTag);
				})
				.then(() => {
					res.sendStatus(200);
				})
				.catch((err) => {
					console.log(err);
					res.sendStatus(500);
				});
		});

		app.get("/products", async (req: Request, res: Response) => {
			const products = await connection
				.getRepository(Product)
				.createQueryBuilder("products")
				.getMany();
			res.send(products.map(ProductCm.fromDbModel));
		});
	})
	.catch((err) => {
		console.log("ERROR: ", err);
	});
