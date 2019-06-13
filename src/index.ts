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

    app.post('/place_order', (req: Request, res: Response) => {
          const orderedProducts: number[] = req.body.products

          // loop through products, extract tags, find userTag combination: if not present Add one
          orderedProducts.forEach(productString => {
            productRepo.findOne({ id: productString })
            .then(product => {
              const productTags = product.tags;
              productTags.forEach(tag => {
                userTagRepo.findOne({ userId: req.body.userId, tagId: tag.id })
                .then(userTag => {
                  userTag.counter += 1
                  userTagRepo.save(userTag);

                }).catch(() => {
                  const newUserTag = userTagRepo.create({
                    userId: req.body.userId,
                    tagId: tag.id,
                    counter: 1
                  })

                  userTagRepo.save(newUserTag);
                })
              })
            }).catch(err => {
              console.log('Could not retrieve product: ', err)
              res.status(404)
            })
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
