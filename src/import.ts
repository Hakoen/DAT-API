import csv from 'csv-parser'
import fs from 'fs'
import { stringify } from 'querystring'
import { Repository } from 'typeorm'
import { Product, ProductCategory } from './entities'
import { getRandomArbitrary, toTitleCase } from './helpers'

class McDonaldsImporter {
  public file: string
  public rows: Row[] = []

  constructor(file: string) {
    this.file = file
  }

  public async import(
    categories: Repository<ProductCategory>,
    products: Repository<Product>
  ) {
    return new Promise((res, rej) => {
      fs.createReadStream(this.file)
        .pipe(
          csv({
            headers: [
              'ITEM',
              '_',
              '_',
              '_',
              '_',
              '_',
              '_',
              '_',
              '_',
              '_',
              '_',
              'CATEGORY'
            ],
            mapHeaders: ({ header, index }) => {
              if (header === 'ITEM' || header === 'CATEGORY') {
                return header.toLowerCase()
              } else {
                return null
              }
            }
          })
        )
        .on('headers', () => {})
        .on('data', (row: Row) => {
          this.rows = [...this.rows, row]
        })
        .on('end', async () => {
          for (const row of this.rows) {
            await this.parseRow(row, categories, products)
          }
          res(200)
        })
        .on('error', (error) => {
          rej(error)
        })
    })
  }

  private async parseRow(
    row: Row,
    categories: Repository<ProductCategory>,
    products: Repository<Product>
  ) {
    const categoryName: string = this.mapCategory(row.category)
    let category: ProductCategory = await categories.findOne({
      where: {
        name: categoryName
      }
    })
    if (!category) {
      category = categories.create({
        name: categoryName,
        iconUrl: this.mapCategoryIcon(row.category)
      })
      await categories.save(category)
    }
    const product = await products.findOne({
      where: { name: row.item }
    })
    if (!product) {
      const newProduct = products.create({
        name: row.item,
        price: parseFloat(this.getProductPrice(category.name).toString()),
        ProductCategory: category
      })
      await products.save(newProduct)
    }
  }

  private mapCategory(categoryName: string) {
    switch (categoryName.toUpperCase()) {
      case 'SNACKSIDE':
        return 'Snack & Sides'
      default:
        return toTitleCase(categoryName)
    }
  }

  private mapCategoryIcon(categoryName: string) {
    const urlPrefixes = {
      mcDonalds:
        'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/',
      topSecretRecipies: 'https://bigoven-res.cloudinary.com/image/upload/'
    }

    switch (categoryName.toUpperCase()) {
      case 'BURGER':
        return `${urlPrefixes.mcDonalds}nav_burgers_80x80.jpg?$Category_Mobile$`
      case 'CHICKEN':
        return `${
          urlPrefixes.mcDonalds
        }nav_chicken_&_sandwiches_80x80.jpg?$Category_Mobile$`
      case 'BREAKFAST':
        return `${
          urlPrefixes.mcDonalds
        }nav_breakfast_80x80.png?$Category_Mobile$`
      case 'SALAD':
        return `${urlPrefixes.mcDonalds}nav_salads_80x80.jpg?$Category_Mobile$`
      case 'SNACKSIDE':
        return `${
          urlPrefixes.mcDonalds
        }nav_snacks_&_sides_80x80.jpg?$Category_Mobile$`
      case 'BEVERAGE':
      default:
        return `${urlPrefixes.mcDonalds}nav_drinks_80x80.jpg?$Category_Mobile$`
      case 'MCCAFE':
        return `${urlPrefixes.mcDonalds}nav_mccafe_80x80.jpg?$Category_Mobile$`
      case 'DESSERT':
        return `${
          urlPrefixes.mcDonalds
        }nav_desserts_&_shakes_80x80.jpg?$Category_Mobile$`
      case 'CONDIMENT':
        return `${
          urlPrefixes.topSecretRecipies
        }t_recipe-256/mcdonalds-special-sauce-big-mac-sauce-2026411.jpg`
      case 'ALLDAYBREAKFAST':
        return `${
          urlPrefixes.mcDonalds
        }nav_breakfast_80x80.png?$Category_Mobile$`
      case 'ADBISCUIT':
        return `${urlPrefixes.mcDonalds}nav_bakery_80x80.jpg?$Menu_Thumbnail$`
      case 'ADBMUFFIN':
        return `${urlPrefixes.mcDonalds}nav_bakery_80x80.jpg?$Menu_Thumbnail$`
      case 'HAPPYMEAL':
        return `${
          urlPrefixes.mcDonalds
        }nav_happy_meal_80x80.jpg?$Menu_Thumbnail$`
      case 'MCPICK2A':
        return `${
          urlPrefixes.mcDonalds
        }nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$`
      case 'SIGNATURE':
        return `${
          urlPrefixes.mcDonalds
        }nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$`
      case 'MCPICK2B':
        return `${
          urlPrefixes.mcDonalds
        }nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$`
      case 'MCPICK2C':
        return `${
          urlPrefixes.mcDonalds
        }nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$`
    }
  }

  private getProductPrice(categoryName: string) {
    switch (categoryName.toUpperCase()) {
      case 'BURGER':
      case 'CHICKEN':
      case 'MCPICK2A':
      case 'SIGNATURE':
      case 'MCPICK2B':
      case 'MCPICK2C':
        return getRandomArbitrary(1, 5)
      case 'BREAKFAST':
      case 'SNACKSIDE':
      case 'DESSERT':
      case 'ALLDAYBREAKFAST':
      case 'CONDIMENT':
      case 'ADBMUFFIN':
        return getRandomArbitrary(1, 3)
      case 'SALAD':
      case 'BEVERAGE':
      case 'MCCAFE':
      case 'ADBISCUIT':
      case 'HAPPYMEAL':
        return getRandomArbitrary(1, 2)
      default:
        return getRandomArbitrary(0, 1)
    }
  }
}

interface Row {
  item: string
  category: string
}

export { McDonaldsImporter }
