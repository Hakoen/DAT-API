import express, { Request, Response } from 'express'
import 'reflect-metadata'
import { Connection } from 'typeorm'
import { PersonId } from './httpModels'
import { Product, Tag, UserTag } from './models'

export const getRecommendations = async (
  connection: Connection,
  userId: PersonId
): Promise<number[]> => {
  const recTags = await connection
    .getRepository(UserTag)
    .createQueryBuilder('userTag')
    .where('userTag.userId = :id', { id: userId })
    .leftJoinAndSelect(Tag, 'tag', 'tag.id = userTag.tagId')
    .getMany()

  recTags.sort((userTag1: UserTag, userTag2: UserTag) => {
    return userTag1.counter < userTag2.counter ? 1 : -1
  })

  let products1: Product[] = []
  let products2: Product[] = []

  if (recTags.length > 1) {
    products1 = await connection
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tag')
      .where('tag.id = :id', { id: recTags[0].tagId })
      .take(7)
      .getMany()

    products2 = await connection
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tag')
      .where('tag.id = :id', {
        id: recTags[1].tagId
      })
      .take(3)
      .getMany()
  } else if (recTags.length === 1) {
    products1 = await connection
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tag')
      .where('tag.id = :id', { id: recTags[0].tagId })
      .take(10)
      .getMany()
  }

  const recProducts: number[] = []
  products1.map((p1) => recProducts.push(p1.id))
  products2.map((p2) => recProducts.push(p2.id))

  return recProducts
}
