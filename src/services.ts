import { createConnection } from "typeorm";
import "reflect-metadata";
import express, { Request, Response } from "express";
import {Product, User, ProductCategory, } from "./Entities";





export const getProducts = async () : Promise<Product[]> =>
{
    const connection = await createConnection()
    
    const products = await connection
        .getRepository(Product)
        .createQueryBuilder("products")
        .getMany();

    return products;
}




