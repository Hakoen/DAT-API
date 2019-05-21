interface orderType {
    prodcutIds: string[],
    userId: string,
}


export function isOrder(order: orderType): boolean { //Faalt op een of andere manier altijd
    console.log('CALLLEEEDDDD: ', order)
    try
    {
        console.log('try: ', order.prodcutIds.length)
        for(let i: number = 0; i < order.prodcutIds.length; i++) {
            if(typeof order.prodcutIds[i] !== 'string') {
                return false;
            }
        }

        return true;
    }
    catch 
    {
        return false;
    }
}