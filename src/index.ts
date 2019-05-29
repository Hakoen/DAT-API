import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import 'reflect-metadata'
import {
  Connection,
  createConnection,
  getConnection,
  getCustomRepository,
  getManager,
  ReplSet
} from 'typeorm'
import { ProductCm, UserCm } from './client_models'
import { ClientModel } from './client_models/clientModel'
import { Product, Tag, User, ProductCategory } from './Entities'
import { getProducts } from './services'
import { isOrder } from './validation/order'
import path from 'path'
import { McDonaldsImporter } from './import'

const app = express()
const port = 8080

createConnection()
  .then(connection => {
    const usersRepo = connection.getRepository(User)
    const tagRepo = connection.getRepository(Tag)
    const categories = connection.getRepository(ProductCategory)
    const products = connection.getRepository(Product)

    app.use(bodyParser.json())
    // app.use(cors())

    app.listen(port, () => {
      console.log(`server is running on: http://localhost:${port}`)
    })

    app.post('/place_order', (req: Request, res: Response) => {
      res.send(isOrder(req.body))
    })

    app.post('/tag', (req: Request, res: Response) => {
      const newTag = tagRepo.create({
        name: req.body.name,
        color: req.body.color
      })

      tagRepo
        .save(newTag)
        .then(() => {
          res.sendStatus(201)
        })
        .catch(err => {
          console.log(err)
          res.sendStatus(501)
        })
    })

    app.delete('/tag', (req: Request, res: Response) => {
      tagRepo
        .findOne({ name: req.body.name })
        .then(deleteTag => {
          tagRepo.delete(deleteTag)
        })
        .then(() => {
          res.sendStatus(200)
        })
        .catch(err => {
          console.log(err)
          res.sendStatus(500)
        })
    })

    app.get('/products', async (req: Request, res: Response) => {
      const products = await connection
        .getRepository(Product)
        .createQueryBuilder('products')
        .getMany()
      res.send(products.map(ProductCm.fromDbModel))
    })

    app.post('/parse', async (req, res) => {
      try {
        const importer = new McDonaldsImporter(
          path.resolve(__dirname, 'data', 'mcdonalds-products-test.csv')
        )
        await importer.import(categories, products)
        res.status(201)
        res.send('Products parsed.')
      } catch (error) {
        res.status(500)
        res.send()
        console.log(error)
      }
    })
  })
  .catch(err => {
    console.log('ERROR: ', err)
  })
