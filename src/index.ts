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
import {
  DetectResponse,
  IdentifyResponse,
  PersonCreateResponse
} from './httpModels'
import Axios, { AxiosResponse } from 'axios'
import * as Path from 'path'
import { compareCandidateObjects, compareFaceObjects } from './helpers'
import { config } from 'dotenv'

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

    app.post('/login', async (req: Request, res: Response) => {
      const AuthAxios = Axios.create({
        headers: { 'Ocp-Apim-Subscription-Key': process.env.FACE_API_KEY }
      })
      const baseUrl =
        'https://westeurope.api.cognitive.microsoft.com/face/v1.0/'
      const personGroupId = 'allon-test'

      const createPerson = () => {
        const personName = `Customer ${userTagRepo.count()}`
        AuthAxios.post<PersonCreateResponse>(
          `${baseUrl}persongroups/${personGroupId}/persons`,
          {
            name: personName,
            userData: personName
          }
        )
          .then((personData) => {
            const faceCreateRequests: Array<Promise<any>> = [
              AuthAxios.post(
                `${baseUrl}persongroups/${personGroupId}/person/${
                  personData.data.personId
                }/persistedFaces`,
                { url: req.body.main_picture_url }
              ),
              ...req.body.picture_urls.map((url: string) => {
                return AuthAxios.post(
                  Path.resolve(
                    `${baseUrl}persongroups/${personGroupId}/person/${
                      personData.data.personId
                    }/persistedFaces`
                  ),
                  { url }
                )
              })
            ]
            Promise.all(faceCreateRequests)
              .then((_) => {
                AuthAxios.post(`${baseUrl}persongroups/${personGroupId}/train`)
                  .then((_) => {
                    res.status(200)
                    res.send({
                      user_id: personData.data.personId,
                      recommended_products: []
                    })
                  })
                  .catch((_) => {
                    res.status(500)
                    res.send(
                      `Something went wrong training the person group. Please contact the site adminstrator.`
                    )
                  })
              })
              .catch((e) => {
                console.log(JSON.stringify(e, null, 2))
                AuthAxios.delete(
                  `${baseUrl}persongroups/${personGroupId}/person/${
                    personData.data.personId
                  }`
                ).catch((_) => {
                  res.status(500)
                  res.send(
                    'Something went wrong while deleting the person when adding the faces went wrong. Please contact the site adminstrator.'
                  )
                })
                res.status(500)
                res.send(
                  `Something went wrong adding the faces. Please contact the site adminstrator.`
                )
              })
          })
          .catch((e) => {
            console.log(JSON.stringify(e, null, 2))
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
          AuthAxios.post<DetectResponse>(
            `${baseUrl}detect?returnFaceId=true&returnFaceLandmarks=false`,
            { url: req.body.main_picture_url }
          )
            .then((_) => {})
            .catch((e) => {
              console.log(JSON.stringify(e, null, 2))
            })

          const detectRequest = AuthAxios.post<DetectResponse>(
            `${baseUrl}detect?returnFaceId=true&returnFaceLandmarks=false`,
            { url: req.body.main_picture_url }
          )
          const detectRequests: Array<
            Promise<AxiosResponse<DetectResponse>>
          > = req.body.picture_urls.map((url: string) => {
            return AuthAxios.post<DetectResponse>(
              `${baseUrl}detect?returnFaceId=true&returnFaceLandmarks=false`,
              { url }
            )
          })

          const detectResponses = await detectRequest
          const faceIds = detectResponses.data
            .map((detectResponse) => detectResponse.faceId)
            .filter((value, index, self) => self.indexOf(value) === index)

          if (faceIds.length > 0) {
            try {
              const identifyResponse = await AuthAxios.post<IdentifyResponse>(
                `${baseUrl}identify`,
                {
                  largePersonGroupId: personGroupId,
                  faceIds,
                  maxNumOfCandidatesReturned: 1,
                  confidenceThreshold: 0.8
                }
              )
              console.log(
                'Before ordering: ',
                JSON.stringify(identifyResponse.data)
              )
              const faces = [
                ...identifyResponse.data
                  .map((face) => {
                    const candidates = [
                      ...face.candidates.sort(compareCandidateObjects)
                    ]
                    return {
                      ...face,
                      candidates
                    }
                  })
                  .sort(compareFaceObjects)
              ]
              console.log('After ordering: ', JSON.stringify(faces))
              res.status(200)
              // TODO: Send recommended products
              res.send({
                user_id: faces[0].candidates[0].personId,
                recommended_products: []
              })
            } catch (e) {
              console.log(JSON.stringify(e, null, 2))
              if (e.code) {
                if (e.code === 409) {
                  createPerson()
                }
              }
              res.status(500)
              res.send(
                `Something went wrong when identifying faces in the photos.`
              )
            }
          } else {
            Promise.all(detectRequests)
              .then((data) => {
                const secondTryFaceIds = data
                  .map((requests) =>
                    requests.data.map((detectResponse) => detectResponse.faceId)
                  )
                  .reduce((prev, cur) => [...prev, ...cur])
                  .filter((value, index, self) => self.indexOf(value) === index)
                if (secondTryFaceIds.length > 0) {
                  AuthAxios.post(`${baseUrl}identify`, {
                    largePersonGroupId: personGroupId,
                    faceIds: secondTryFaceIds,
                    maxNumOfCandidatesReturned: 1,
                    confidenceThreshold: 0.8
                  })
                    .then((identityData) => {})
                    .catch((e) => {
                      console.log(JSON.stringify(e, null, 2))
                      res.status(500)
                      res.send(
                        `Something went wrong when identifying faces in the photos.`
                      )
                    })
                } else {
                  createPerson()
                }
              })
              .catch((e) => {
                console.log(JSON.stringify(e, null, 2))
                res.status(500)
                res.send(
                  `Something went wrong when detecting faces in the photos.`
                )
              })
          }
        } catch (e) {
          console.log(JSON.stringify(e, null, 2))
          res.status(500)
          res.send(
            `Something went wrong when detecting faces in the main photo.`
          )
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
