interface orderType {
  prodcutIds: string[]
  userId: string
}

export function isOrder(order: orderType): boolean {
  // Faalt op een of andere manier altijd
  console.log('CALLLEEEDDDD: ', order)
  try {
    console.log('try: ', order.prodcutIds.length)
    for (const productId of order.prodcutIds) {
      if (typeof productId !== 'string') {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}
