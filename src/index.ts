import Axios, { AxiosResponse } from 'axios'
import bodyParser from 'body-parser'
import { config } from 'dotenv'
import express, { Request, Response } from 'express'
import * as Path from 'path'
import 'reflect-metadata'
import { createConnection, Repository } from 'typeorm'
import { FaceApi } from './api/faceApi'
import { AllModel } from './client_models/allmodelCm'
import { compareCandidateObjects, compareFaceObjects } from './helpers'
import {
  DetectResponse,
  FaceId,
  IdentifyResponse,
  PersonCreateResponse,
  PersonId
} from './httpModels'
import { McDonaldsImporter } from './import'
import { Product, ProductCategory, Tag, UserTag } from './models'
import { ProductForClient } from './models/productForClient'
import { User } from './models/userDbm'
import { getRecommendations } from './services'

const app = express()
const port = 8080

config({ path: Path.resolve(__dirname, '..', '.env') })

createConnection()
  .then(async (connection) => {
    // const imp = new McDonaldsImporter('./src/data/mcdonalds-products.csv');
    // await imp.import(
    //  connection.getRepository(ProductCategory),
    //  connection.getRepository(Product)
    // );
    // console.log('Done');
    const userTagRepo = connection.getRepository(UserTag)
    const userRepo = connection.getRepository(User)
    const tagRepo = connection.getRepository(Tag)
    const productRepo = connection.getRepository(Product)

    app.use(bodyParser.json())
    // app.use(cors())

    app.listen(port, () => {
      console.log(`server is running on: http://localhost:${port}`)
    })

    app.post('/place_order', async (req: Request, res: Response) => {
      const orderedProducts: number[] = req.body.products

      // loop through products, extract tags, find userTag combination: if not present Add one
      orderedProducts.forEach(async (productString) => {
        const products = await connection
          .getRepository(Product)
          .createQueryBuilder('product')
          .where('product.id = :id', { id: productString })
          .leftJoinAndSelect('product.tags', 'tag')
          .getMany()

        console.log(products)

        products.forEach((product: Product) => {
          product.tags.forEach((tag) => {
            try {
              userTagRepo
                .findOne({ userId: req.body.userId, tagId: tag.id })
                .then((userTag) => {
                  userTag.counter += 1
                  userTagRepo.save(userTag)
                })
                .catch((_) => {
                  const newUserTag = userTagRepo.create({
                    userId: req.body.userId,
                    tagId: tag.id,
                    counter: 1
                  })
                  userTagRepo.save(newUserTag)
                })
            } catch {
              const newUserTag = userTagRepo.create({
                userId: req.body.userId,
                tagId: tag.id,
                counter: 1
              })
              userTagRepo.save(newUserTag)
            }
          })
        })
      })
      res.send('Success')
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

    app.post('/recommendations', async (req: Request, res: Response) => {
      const recProducts = await getRecommendations(connection, req.body.userId)
      res.send({ recommended_products: recProducts })
    })

    app.get('/products', async (req: Request, res: Response) => {
      const products = await connection
        .getRepository(Product)
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.productCategory', 'productCategory')
        .leftJoinAndSelect('product.tags', 'tag')
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
        const tagIds: number[] = []

        if (product.tags !== undefined && product.tags.length > 0) {
          product.tags.forEach((tag) => {
            tagIds.push(tag.id)
          })
          productsS.push({
            category: product.productCategory.id,
            id: product.id,
            name: product.name,
            price: product.price,
            tags: tagIds
          })
        }
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

    app.post('/parse', async (req, res) => {
      try {
        const imp = new McDonaldsImporter('./src/data/mcdonalds-products.csv')
        await imp.import(
          connection.getRepository(ProductCategory),
          connection.getRepository(Product)
        )
        res.status(201)
        res.send('Products parsed.')
      } catch (error) {
        res.status(500)
        res.send()
        console.log(error)
      }
    })

    app.post('/login', async (req: Request, res: Response) => {
      if (
        !req.body.picture_urls ||
        req.body.picture_urls.length !== 6 ||
        !req.body.main_picture_url
      ) {
        res.status(400)
        res.send('Wrong request, dude')
        return
      }

      let mainDetectedFaces: FaceId[]

      try {
        mainDetectedFaces = await FaceApi.detect(req.body.main_picture_url)
      } catch (e) {
        console.log(JSON.stringify(e, null, 2))
        res.status(500)
        res.send(`Failed to detect faces. Error: ${e}`)
        return
      }

      console.log(mainDetectedFaces)

      if (mainDetectedFaces.length === 0) {
        res.status(400)
        res.send('No person detected on picture.')
        return
      }

      const identifiedFaces = await FaceApi.identify(mainDetectedFaces)
      let user: PersonId
      if (identifiedFaces.length >= 1) {
        user = identifiedFaces[0].person
      } else {
        const userCount = await userRepo.count()
        user = await FaceApi.createUser(
          req.body.picture_urls,
          userCount.toString()
        )
      }
      res.status(200)

      // TODO: Send recommended products
      const recommendedProducts = await getRecommendations(connection, user)
      res.send({
        user_id: user,
        recommended_products: recommendedProducts
      })
    })
  })
  .catch((err) => {
    console.log('ERROR: ', err)
  })
