import "reflect-metadata";
import {
	createConnection,
	getConnection,
	Connection,
	getManager,
	getCustomRepository
} from "typeorm";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { User, Tag, Product } from "./Entities";
import { isOrder } from "./validation/order";
import { getProducts } from "./services";

const app = express();
const port = 8080;

createConnection()
	.then(connection => {
		const usersRepo = connection.getRepository(User);
		const tagRepo = connection.getRepository(Tag);

		app.use(bodyParser.json());
		//app.use(cors())

		app.listen(port, () => {
			// tslint:disable-next-line:no-console
			console.log(`server is running on: http://localhost:${port}`);
		});

		app.post("/place_order", (req: Request, res: Response) => {
			res.send(isOrder(req.body));
		});

		app.post("/tag", (req: Request, res: Response) => {
			const newTag = tagRepo.create({
				name: req.body.name,
				color: req.body.color
			});

			tagRepo
				.save(newTag)
				.then(() => {
					res.sendStatus(201);
				})
				.catch(err => {
					console.log(err);
					res.sendStatus(501);
				});
		});

		app.delete("/tag", (req: Request, res: Response) => {
			tagRepo
				.findOne({ name: req.body.name })
				.then(deleteTag => {
					tagRepo.delete(deleteTag);
				})
				.then(() => {
					res.sendStatus(200);
				})
				.catch(err => {
					console.log(err);
					res.sendStatus(500);
				});
		});

		app.get("/products", async (req: Request, res: Response) => {
			const products = await connection
				.getRepository(Product)
				.createQueryBuilder("products")
				.getMany();
			res.send(products);
		});
	})
	.catch(err => {
		console.log("ERROR: ", err);
	});
