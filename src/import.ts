import { getRandomArbitrary } from './helpers'
import fs from 'fs'
import csv from 'csv-parser'
import { Repository } from 'typeorm'
import { ProductCategory, Product } from './entities'
import { stringify } from 'querystring'

class McDonaldsImporter {
  file: string
  rows: Row[] = []

  constructor(file: string) {
    this.file = file
  }

  async import(
    categories: Repository<ProductCategory>,
    products: Repository<Product>
  ) {
    let imported = 0
    return new Promise((res, rej) => {
      fs.createReadStream(this.file)
        .pipe(
          csv({
            headers: [
              'ITEM',
              'CAL',
              'FAT',
              'SFAT',
              'TFAT',
              'CHOL',
              'SALT',
              'carb',
              'CARB',
              'SGR',
              'PRO',
              'CATEGORY'
            ],
            mapHeaders: ({ header, index }) => {
              if (header == 'ITEM' || header == 'CATEGORY') {
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
        .on('end', () => {
          this.rows.map(async (row: Row) => {
            try {
              let category = await categories.findOne({
                where: {
                  name: this.mapCategory(row.category)
                }
              })
              if (category == undefined) {
                category = categories.create({
                  name: this.mapCategory(row.category),
                  iconUrl: this.mapCategoryIcon(row.category)
                })
                await categories.save(category)
              }
              return
              const product = await products.findOne({
                where: { name: row.item }
              })
              if (!product) {
                const newProduct = products.create({
                  name: row.item,
                  price: parseFloat(
                    this.getProductPrice(category.name).toString()
                  ),
                  ProductCategory: category
                })
                await products.save(newProduct)
                imported += 1
              }
            } catch (error) {
              console.log(error)
            }
          })
        })
        .on('error', error => {
          rej(error)
        })
    })
  }

  private mapCategory(categoryName: string) {
    switch (categoryName.toUpperCase()) {
      case 'BURGER':
        return 'Burger'
      case 'CHICKEN':
        return 'Chicken'
      case 'BREAKFAST':
        return 'Breakfast'
      case 'SALAD':
        return 'Salad'
      case 'SNACKSIDE':
        return 'Snack & Sides'
      case 'BEVERAGE':
      default:
        return 'Beverage'
      case 'MCCAFE':
        return 'McCafe'
      case 'DESSERT':
        return 'Dessert'
      case 'CONDIMENT':
        return 'Condiment'
      case 'ALLDAYBREAKFAST':
        return 'AllDayBreakfast'
      case 'ADBISCUIT':
        return 'AdBiscuit'
      case 'ADBMUFFIN':
        return 'AdBMuffin'
      case 'HAPPYMEAL':
        return 'HappyMeal'
      case 'MCPICK2A':
        return 'McPick2A'
      case 'SIGNATURE':
        return 'Signature'
      case 'MCPICK2B':
        return 'McPick2B'
      case 'MCPICK2C':
        return 'McPick2C'
    }
  }

  private mapCategoryIcon(categoryName: string) {
    switch (categoryName.toUpperCase()) {
      case 'BURGER':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_burgers_80x80.jpg?$Category_Mobile$'
      case 'CHICKEN':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_chicken_&_sandwiches_80x80.jpg?$Category_Mobile$'
      case 'BREAKFAST':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_breakfast_80x80.png?$Category_Mobile$'
      case 'SALAD':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_salads_80x80.jpg?$Category_Mobile$'
      case 'SNACKSIDE':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_snacks_&_sides_80x80.jpg?$Category_Mobile$'
      case 'BEVERAGE':
      default:
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_drinks_80x80.jpg?$Category_Mobile$'
      case 'MCCAFE':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_mccafe_80x80.jpg?$Category_Mobile$'
      case 'DESSERT':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_desserts_&_shakes_80x80.jpg?$Category_Mobile$'
      case 'CONDIMENT':
        return 'https://bigoven-res.cloudinary.com/image/upload/t_recipe-256/mcdonalds-special-sauce-big-mac-sauce-2026411.jpg'
      case 'ALLDAYBREAKFAST':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_breakfast_80x80.png?$Category_Mobile$'
      case 'ADBISCUIT':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_bakery_80x80.jpg?$Menu_Thumbnail$'
      case 'ADBMUFFIN':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_bakery_80x80.jpg?$Menu_Thumbnail$'
      case 'HAPPYMEAL':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_happy_meal_80x80.jpg?$Menu_Thumbnail$'
      case 'MCPICK2A':
        return 'McPick2A'
      case 'SIGNATURE':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$'
      case 'MCPICK2B':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$'
      case 'MCPICK2C':
        return 'https://www.mcdonalds.com/is/image/content/dam/usa/nfl/assets/nav/nav_extra_value_meal_80x80.jpg?$Menu_Thumbnail$'
    }
  }

  private getProductPrice(categoryName: string) {
    switch (categoryName.toUpperCase()) {
      case 'BURGER':
        return getRandomArbitrary(1, 5)
      case 'CHICKEN':
        return getRandomArbitrary(1, 5)
      case 'BREAKFAST':
        return getRandomArbitrary(1, 3)
      case 'SALAD':
        return getRandomArbitrary(1, 2)
      case 'SNACKSIDE':
        return getRandomArbitrary(1, 3)
      case 'BEVERAGE':
        return getRandomArbitrary(1, 2)
      case 'MCCAFE':
        return getRandomArbitrary(1, 2)
      case 'DESSERT':
        return getRandomArbitrary(1, 3)
      case 'CONDIMENT':
      default:
        return getRandomArbitrary(0, 1)
      case 'ALLDAYBREAKFAST':
        return getRandomArbitrary(1, 3)
      case 'ADBISCUIT':
        return getRandomArbitrary(1, 2)
      case 'ADBMUFFIN':
        return getRandomArbitrary(1, 3)
      case 'HAPPYMEAL':
        return getRandomArbitrary(1, 2)
      case 'MCPICK2A':
        return getRandomArbitrary(1, 5)
      case 'SIGNATURE':
        return getRandomArbitrary(1, 5)
      case 'MCPICK2B':
        return getRandomArbitrary(1, 5)
      case 'MCPICK2C':
        return getRandomArbitrary(1, 5)
    }
  }
}

interface Row {
  item: string
  category: string
}

export { McDonaldsImporter }
