import csv from 'csv-parser'
import fs from 'fs'
import { stringify } from 'querystring'
import { Repository } from 'typeorm'
import { Product, ProductCategory } from './entities'
import { getRandomArbitrary } from './helpers'

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
        .on('end', () => {
          // TODO: fix category check, to prevent category duplicates
          this.rows.map(async (row: Row) => {
            let category: ProductCategory = await categories.findOne({
              where: {
                name: this.mapCategory(row.category)
              }
            })
            if (!category) {
              category = categories.create({
                name: this.mapCategory(row.category),
                iconUrl: this.mapCategoryIcon(row.category)
              })
              await categories.save(category)
            }
            return // FIXME: Temporary
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
              imported += 1 // FIXME: What's this doing here?
            }
          })
        })
        .on('error', (error) => {
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
        return 'McPick2A'
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
