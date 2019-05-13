import "reflect-metadata";
import { createConnection } from "typeorm";
import express, { Request, Response } from "express";
// import { User, Tag } from "./entity/User";

const app = express();
const port = 8080;

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
