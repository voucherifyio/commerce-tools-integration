export interface CartActionsInterface {
  setAvailablePromotions: () => Promise<boolean>;
  setFreeShipping: () => Promise<boolean>;
  addCoupon: () => Promise<boolean>;
  getCoupons: () => Promise<boolean>;
  updateCoupon: () => Promise<boolean>;
  removeCoupon: () => Promise<boolean>;
  setCartDiscount: () => Promise<boolean>;
}

export type Item = {
  id: string;
};

export type Cart = {
  items: Item[];
};

export type CartUpdateHandler = (
  cart: Cart,
  actions: CartActionsInterface,
) => Promise<boolean>;

export interface StoreInterface {
  onCartUpdate: (handler: CartUpdateHandler) => void;
  // onOrderUpdate: (cart: CartActionsInterface) => Promise<boolean>;
  // onCustomerUpdate: (customer) => Promise<boolean>;
}
