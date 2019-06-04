import express, { Request, Response } from 'express'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { Product } from './models'

export const getProducts = async (): Promise<Product[]> => {
  const connection = await createConnection()

  const products = await connection
    .getRepository(Product)
    .createQueryBuilder('products')
    .getMany()

  return products
}
