import Axios, { AxiosResponse } from 'axios'
import bodyParser from 'body-parser'
import 'colors'
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
import { logConfig, logError, logRequest, logResponse } from './logging'
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
      logConfig(`Server is running on: http://localhost:${port}`)
    })

    app.get('/', async (req: Request, res: Response) => {
      logRequest('', req)
      res.sendStatus(200)
      res.send()
      logResponse(null, res)
    })

    app.post('/place_order', async (req: Request, res: Response) => {
      logRequest('place_order', req)

      const orderedProducts: number[] = req.body.products

      // loop through products, extract tags, find userTag combination: if not present Add one
      orderedProducts.forEach(async (productString, index: number) => {
        const product = await connection
          .getRepository(Product)
          .createQueryBuilder('product')
          .where('product.id = :id', { id: productString })
          .leftJoinAndSelect('product.tags', 'tag')
<<<<<<< HEAD
          .getOne()

        for (const tag of product.tags) {
          try {
            const newUserTag = new UserTag()
            newUserTag.userId = req.body.user_id
            newUserTag.tagId = tag.id
            newUserTag.counter = 1
            await connection
              .createQueryBuilder()
              .insert()
              .into(UserTag)
              .values(newUserTag)
              .execute()
          } catch (error) {
            await connection
              .createQueryBuilder()
              .update(UserTag)
              .where({
=======
          .getMany()

        products.forEach((product: Product) => {
          product.tags.forEach((tag) => {
            try {
              userTagRepo
                .findOne({ userId: req.body.user_id, tagId: tag.id })
                .then((userTag) => {
                  userTag.counter += 1
                  userTagRepo.save(userTag)
                })
                .catch((_) => {
                  const newUserTag = userTagRepo.create({
                    userId: req.body.user_id,
                    tagId: tag.id,
                    counter: 1
                  })
                  userTagRepo.save(newUserTag)
                })
            } catch {
              const newUserTag = userTagRepo.create({
>>>>>>> 07b4659049ccb2331b052db81a3e6177a0d548fb
                userId: req.body.user_id,
                tagId: tag.id
              })
              .set({ counter: () => 'counter + 1' })
              .execute()
          }
        }
      })
      const result = 'Success'
      res.send(result)
      logResponse(result, res)
    })

    app.post('/tag', (req: Request, res: Response) => {
      logRequest('tag', req)
      const newTag = tagRepo.create({
        name: req.body.name,
        color: req.body.color
      })

      tagRepo
        .save(newTag)
        .then(() => {
          res.sendStatus(201)
          logResponse(null, res)
        })
        .catch((err) => {
          logError(err)
          res.sendStatus(501)
          logResponse(null, res)
        })
    })

    app.delete('/tag', (req: Request, res: Response) => {
      logRequest('tag (DELETE)', req)
      tagRepo
        .findOne({ name: req.body.name })
        .then((deleteTag) => {
          tagRepo.delete(deleteTag)
        })
        .then(() => {
          res.sendStatus(200)
          logResponse(null, res)
        })
        .catch((err) => {
          logError(err)
          res.sendStatus(500)
          logResponse(null, res)
        })
    })

    app.post('/recommendations', async (req: Request, res: Response) => {
      logRequest('recommendations', req)
      const recProducts = await getRecommendations(connection, req.body.user_id)
      const result = { recommended_products: recProducts }
      res.send(result)
      logResponse(result, res)
    })

    app.get('/products', async (req: Request, res: Response) => {
      logRequest('products', req)
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

      const result = AllModel.toAllModel(category, productsCat, tags)
      res.send(result)
      logResponse(result, res)
    })

    app.post('/parse', async (req, res) => {
      logRequest('parse', req)
      try {
        const imp = new McDonaldsImporter('./src/data/mcdonalds-products.csv')
        await imp.import(
          connection.getRepository(ProductCategory),
          connection.getRepository(Product)
        )
        const result = 'Products parsed.'
        res.status(201)
        res.send(result)
        logResponse(result, res)
      } catch (error) {
        logError(error)
        res.status(500)
        res.send()
        logResponse(null, res)
      }
    })

    app.post('/identify', async (req: Request, res: Response) => {
      logRequest('identify', req)
      const detectedFaces = await FaceApi.detect(req.body.url)
      const personIds = await FaceApi.identify(detectedFaces)
      const result = { personIds }
      res.send(result)
      logResponse(result, res)
    })

    app.post('/login', async (req: Request, res: Response) => {
      logRequest('login', req)
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
        logError(JSON.stringify(e, null, 2))
        const result = `Failed to detect faces. Error: ${e}`
        res.status(500)
        res.send(result)
        logResponse(result, res)
        return
      }

      if (mainDetectedFaces.length === 0) {
        const result = 'No person detected in picture.'
        res.status(400)
        res.send(result)
        logResponse(result, res)
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
        const newUser = new User()
        newUser.userId = user
        userRepo.save(newUser)
      }
      res.status(200)

      // TODO: Send recommended products
      const recommendedProducts = await getRecommendations(connection, user)

      const result = {
        user_id: user,
        recommended_products: recommendedProducts
      }

      res.send(result)
      logResponse(result, res)
    })
  })
  .catch((err) => {
    logError(err)
  })
