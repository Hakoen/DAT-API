import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import 'reflect-metadata'
import { createConnection, Repository } from 'typeorm'
import { AllModel } from './client_models/allmodelCm'
import { McDonaldsImporter } from './import'
import { ProductCategory } from './models'
import { Tag, User } from './models/'
import { Product } from './models/productDbm'
import { ProductForClient } from './models/productForClient'

const app = express()
const port = 8080

createConnection()
  .then(async (connection) => {
    // const imp = new McDonaldsImporter('./src/data/mcdonalds-products.csv')
    // await imp.import(
    //   connection.getRepository(ProductCategory),
    //   connection.getRepository(Product)
    // )
    // console.log('Done')
    const usersRepo = connection.getRepository(User)
    const tagRepo = connection.getRepository(Tag)
    //  const userTagRepo = connection.getRepository(UserTag);

    app.use(bodyParser.json())
    // app.use(cors())

    app.listen(port, () => {
      console.log(`server is running on: http://localhost:${port}`)
    })

    app.post('/place_order', (req: Request, res: Response) => {
      usersRepo
        .findOne({ id: req.body.user_id })
        .then((user) => {
          const orderedProducts: string[] = req.body.products
          const tags: Tag[] = user.tags

          // loop through tags in order, add to user's tag array
          orderedProducts.forEach((tagString) => {
            tagRepo
              .findOne({ name: tagString })
              .then((tag) => {
                tags.push(tag)
              })
              .catch((err) => {
                console.log(`Could not find tag (${tagString}): `, err)
                res.sendStatus(404)
              })
          })

          user.tags = tags
          usersRepo
            .save(user)
            .then(() => {
              res.sendStatus(201)
            })
            .catch((err) => {
              console.log('Could not save user\'s order: ', err)
              res.sendStatus(406)
            })
        })
        .catch((err) => {
          console.log('Could not find user account: ', err)
          res.sendStatus(404)
        })
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
        .catch((err) => {
          console.log(err)
          res.sendStatus(501)
        })
    })

    app.delete('/tag', (req: Request, res: Response) => {
      tagRepo
        .findOne({ name: req.body.name })
        .then((deleteTag) => {
          tagRepo.delete(deleteTag)
        })
        .then(() => {
          res.sendStatus(200)
        })
        .catch((err) => {
          console.log(err)
          res.sendStatus(500)
        })
    })

    app.get('/products', async (req: Request, res: Response) => {
      const products = await connection
        .getRepository(Product)
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.productCategory', 'productCategory')
        .getMany()

      const category = await connection
        .getRepository(ProductCategory)
        .createQueryBuilder()
        .getMany()

      const tags = await connection
        .getRepository(Tag)
        .createQueryBuilder()
        .getMany()

      const productsS: ProductForClient[] = []

      products.forEach((product) => {
        productsS.push({
          category: product.productCategory.id,
          id: product.id,
          name: product.name,
          price: product.price,
          tags: []
        })
      })

      const productsCat: ProductForClient[] = []

      category.forEach((cat) => {
        const productsByCat = productsS.filter((prod) => {
          return prod.category === cat.id
        })
        productsCat.push(...productsByCat.slice(0, 10))
      })

      res.send(AllModel.toAllModel(category, productsCat, tags))
      // res.send(productsByCat)
    })
  })
  .catch((err) => {
    console.log('ERROR: ', err)
  })
