class Integration {
   constructor(private store: IStore, voucherifyConnector){ // DI container Store -> IStore -> CommercetoolsService
        this.store.setCartUpdateListener((cart, storeActions) => {
            this.onCartUpdate(cart, storeActions)
        })
   }

   checkIfUsedPricesFromStoreAndVoucherifyMatch(discounts, storeProducts){}
   updateCartByProperPriceses(cart)

   async onCartUpdate(cart, storeActions){
     // flow integracji
     // pobrać promocje voucherify connector
     const promiotions = await voucherifyConnector.getPromotions()
     storeActions.setPromotions(promotions)
     let discounts = voucherifyConnector.validate(cart)

     if(this.checkIfUsedPricesFromStoreAndVoucherifyMatch()){
        const fixedCart = this.updateCartByProperPriceses(cart)
        discounts = voucherifyConnector.validate(fixedCart)
     }

     discounts.forEach(discount => {
        if(discount.type == 'unit'){
            storeActions.setUnitType()
        }
        if(discount.type == 'value'){
            storeActions.setCartDiscount()
        }
        if(discount.type == 'unit'){
            storeActions.freeSHipping()
        }
     })
   }
}

interface Products {

}

interface Codes {

}

interface Cart {
    products: Products[]
    codes: Codes[]
}

interface StoreActions {
    setPromotions(promotions)
    setFreeShipping()
    setCartDiscount()
    setUnitType()
    getProducts()
}

interface IStore {
    setCartUpdateListener((cart: Cart, storeActions: StoreActions) => {})

}

// Store module

class ActionBuilder implements StoreActions {
    private actions = CTActions[]
    // wymagane przez Integracje
    setPromotions()
    setFreeShipping(){}
    setUnitType(){}
    setCartDiscount()
    // specuyfuiczne dla  CT
    buildActions(){}
}

class CommercetoolsService implements IStore {
    private handler: () => {};
    public setCartUpdateListener(handler: () => {}){
        this.handler = handler;
    }
    onCartUpdate(cartUpdatePayload){
         if(v ==1){
            return {}
         }

        const actionBuilder = new ActionBuilder()

        // tax category

        if(typeof this.handler === 'function'){
            this.handler(translateCtCartToCart(cartUpdatePayload) , actionBuilder)
        }
        return actionBuilder.buildActions();
    }
}

class CommercetoolsController {
    cosntructor(private commercetoolsService: CommercetoolsService)
    @POST('/)
    cartUpdate(body){
        // walidacja requestu DTO
        const actions = this.commercetoolsService.onCartUpdate(body)
        return actions;
    }
}