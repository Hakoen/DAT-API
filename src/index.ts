import "reflect-metadata";
import { createConnection } from "typeorm";
import express, { Request, Response } from "express";
import bodyParser from 'body-parser'
import { User, Tag } from "./Entities";
import { isOrder } from './validation/order'
import { getProducts} from "./services" 

const app = express();
const port = 8080;

app.use(bodyParser.json())

createConnection()
	.then(async connection => {
		await connection.synchronize();
	})
	.catch(error => console.log(error));

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server is running on: http://localhost:${port}`);
});

app.get("/user", (req: Request, res: Response) => {
	res.send("Working");
});

app.post('/place_order', (req: Request, res: Response) => {
	console.log('Ordert:', req.body)

	res.send(isOrder(req.body))
})
app.get("/products",
    async(req: Request, res: Response) => {
        res.send(await getProducts())
    });



