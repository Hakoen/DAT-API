import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import 'reflect-metadata'
import { createConnection, Repository } from 'typeorm'
import { AllModel } from './client_models/allmodelCm'
import { McDonaldsImporter } from './import'
import { ProductCategory } from './models'
import { Tag, UserTag } from './models/'
import { Product } from './models/productDbm'
import { ProductForClient } from './models/productForClient'
import { DetectResponse, IdentifyResponse } from './httpModels'
import Axios from 'axios'
import * as Path from 'path'

const app = express()
const port = 8080

createConnection()
  .then(async (connection) => {
    // const imp = new McDonaldsImporter('./src/data/mcdonalds-products.csv');
    // await imp.import(
    //  connection.getRepository(ProductCategory),
    //  connection.getRepository(Product)
    // );
    // console.log('Done');
    const userTagRepo = connection.getRepository(UserTag)
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

        products.forEach((product: Product) => {
          product.tags.forEach((tag) => {
            try {
              userTagRepo
                .findOne({ userId: req.body.userId, tagId: tag.id })
                .then((userTag) => {
                  userTag.counter += 1
                  userTagRepo.save(userTag)
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

    app.get('/testrec', async (req: Request, res: Response) => {
      const recProducts = await connection
        .getRepository(UserTag)
        .createQueryBuilder('userTag')
        .where('userTag.userId = :id', { id: req.body.userId })
        .leftJoinAndSelect(Tag, 'tag', 'tag.id = userTag.tagId')
        .getMany()

      recProducts.sort((userTag1: UserTag, userTag2: UserTag) => {
        return userTag1.counter < userTag2.counter ? 1 : -1
      })

      res.send({ test: recProducts[0], test2: recProducts[1] })
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

        if (product.tags !== undefined) {
          product.tags.forEach((tag) => {
            tagIds.push(tag.id)
          })
        }

        productsS.push({
          category: product.productCategory.id,
          id: product.id,
          name: product.name,
          price: product.price,
          tags: tagIds
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

    app.post('login', async (req: Request, res: Response) => {
      const baseUrl =
        'https://westeurope.api.cognitive.microsoft.com/face/v1.0/'
      const faceSetId = 'allon-test'

      const createPerson = () => {
        const personName = `Customer ${userTagRepo.count()}`
        Axios.post(
          Path.resolve(
            baseUrl,
            'persongroups',
            personName.toLowerCase().replace(' ', '-'),
            'persons'
          ),
          {
            name: personName,
            userData: personName
          }
        )
          .then((_) => {})
          .catch((e) => {
            res.status(500)
            res.send(
              `Something went wrong creating a new account. Please contact the site adminstrator.`
            )
          })
      }

      if (
        req.body.picture_urls &&
        req.body.picture_urls.length === 6 &&
        req.body.main_picture_url
      ) {
        try {
          const detectRequest = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.main_picture_url }
          )
          const detectRequest2 = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.picture_urls[0] }
          )
          const detectRequest3 = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.picture_urls[1] }
          )
          const detectRequest4 = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.picture_urls[2] }
          )
          const detectRequest5 = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.picture_urls[3] }
          )
          const detectRequest6 = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.picture_urls[4] }
          )
          const detectRequest7 = Axios.post<DetectResponse>(
            Path.resolve(
              baseUrl,
              'detect?returnFaceId=true&returnFaceLandmarks=false'
            ),
            { url: req.body.picture_urls[5] }
          )

          const detectResponses = await detectRequest
          const faceIds = detectResponses.data
            .map((detectResponse) => detectResponse.faceId)
            .filter((value, index, self) => self.indexOf(value) === index)

          if (faceIds.length > 0) {
            try {
              const identifyResponse = await Axios.post(
                Path.resolve(baseUrl, '/identify'),
                {
                  largePersonGroupId: faceSetId,
                  faceIds: faceIds,
                  maxNumOfCandidatesReturned: 1,
                  confidenceThreshold: 0.8
                }
              )
            } catch (e) {
              if (e.code) {
                if (e.code === 409) {
                  // Maak een nieuw persoon aan.
                }
              }
              res.status(500)
              res.send(
                `Something went wrong when identifying faces in the photos.`
              )
            }
          } else {
            Promise.all([
              detectRequest2,
              detectRequest3,
              detectRequest4,
              detectRequest4,
              detectRequest5,
              detectRequest6,
              detectRequest7
            ])
              .then((data) => {
                const faceIds = data
                  .map((requests) =>
                    requests.data.map((detectResponse) => detectResponse.faceId)
                  )
                  .reduce((prev, cur) => [...prev, ...cur])
                  .filter((value, index, self) => self.indexOf(value) === index)
                if (faceIds.length > 0) {
                  Axios.post(Path.resolve(baseUrl, '/identify'), {
                    largePersonGroupId: faceSetId,
                    faceIds: faceIds,
                    maxNumOfCandidatesReturned: 1,
                    confidenceThreshold: 0.8
                  })
                    .then((data) => {})
                    .catch((e) => {
                      res.status(500)
                      res.send(
                        `Something went wrong when identifying faces in the photos.`
                      )
                    })
                } else {
                  // Maak een nieuw persoon aan.
                }
              })
              .catch((e) => {
                res.status(500)
                res.send(
                  `Something went wrong when detecting faces in the photos.`
                )
              })
          }
        } catch (e) {
          res.status(500)
          res.send(`Something went wrong when detecting faces in the photos.`)
        }
      } else {
        res.status(400)
        res.send('Wrong request, dude')
      }
    })
  })
  .catch((err) => {
    console.log('ERROR: ', err)
  })
