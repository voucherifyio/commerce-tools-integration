import { Cart, LineItem } from '@commercetools/platform-sdk';
import { ValidateCouponsResult } from '../../types';
import { CartAction, CartActionSetLineItemCustomType } from '../CartAction';
import mapValidateCouponsResultToLineProductsWithFixedAmount from './helpers/fixedPrice';
import { StackableRedeemableResponse } from '@voucherify/sdk';
import addFreeLineItems22 from './helpers/addFreeLineItems';
import addFreeLineItems from '../addFreeLineItems';

type LineItemFixedPrice = {
  lineItemId: string;
  couponFixedPrice: number;
};

function getLineItemCustomFieldActions(
  cart: Cart,
  lineItemsWithFixedAmount,
  applicableCoupons: StackableRedeemableResponse[],
): LineItemFixedPrice[] {
  const applicableCouponsIds = applicableCoupons.map(
    (couponData) => couponData.id,
  );
  const lineItemFixedPrices = [] as LineItemFixedPrice[];

  cart.lineItems.map((lineItem) => {
    // const action = {
    //   action: 'setLineItemCustomType',
    //   lineItemId: lineItem.id,
    //   type: {
    //     key: 'lineItemCodesType',
    //   },
    //   fields: {},
    // } as CartActionSetLineItemCustomType;

    const lineItemWithFixedAmount = lineItemsWithFixedAmount.filter(
      (lineItemWithFixedAmount) =>
        lineItem.productId === lineItemWithFixedAmount.product.source_id,
    );

    if (lineItemWithFixedAmount.length > 0) {
      lineItemFixedPrices.push({
        lineItemId: lineItem.id,
        couponFixedPrice: lineItemWithFixedAmount[0].couponFixedPrice,
      });
    }

    // else {
    //   const appliedFixedPrice = lineItem.custom?.fields?.coupon_fixed_price;
    //
    //   if (appliedFixedPrice) {
    //     lineItemFixedPrices.push({
    //       lineItemId: lineItem.id,
    //       couponFixedPrice: appliedFixedPrice,
    //     });
    //   }
    // }

    // if (applied_codes?.length) {
    //   let _applied_codes = applied_codes
    //     .map((codeString) => JSON.parse(codeString))
    //     .filter((codeData) => applicableCouponsIds.includes(codeData.code));
    //   let totalDiscountQuantity = 0;
    //   for (const applied_code of _applied_codes) {
    //     totalDiscountQuantity += applied_code.quantity;
    //   }
    //   _applied_codes = _applied_codes
    //     .filter((codeData) => codeData.quantity > 0)
    //     .map((codeData) => {
    //       return { ...codeData, totalDiscountQuantity };
    //     });
    //   action.fields.applied_codes = _applied_codes.map((codeData) =>
    //     JSON.stringify(codeData),
    //   );
    // }
  });

  return lineItemFixedPrices;
}

function mergeSetLineItemCustomType(
  lineItems: LineItem[],
  lineItemFixedPrices: LineItemFixedPrice[],
  setLineItemCustomTypeActions: CartActionSetLineItemCustomType[],
) {
  const mergedLineItemIds = [];

  const results = [] as CartActionSetLineItemCustomType[];

  results.push(
    ...setLineItemCustomTypeActions.map((setLineItemCustomTypeAction) => {
      const couponFixedPrice = lineItemFixedPrices.find(
        (lineItemFixedPrice) =>
          lineItemFixedPrice.lineItemId ===
          setLineItemCustomTypeAction.lineItemId,
      )?.couponFixedPrice;
      console.log(lineItemFixedPrices);
      if (couponFixedPrice >= 0) {
        setLineItemCustomTypeAction.fields.coupon_fixed_price =
          couponFixedPrice;
      }

      mergedLineItemIds.push(setLineItemCustomTypeAction.lineItemId);

      return setLineItemCustomTypeAction;
    }),
  );

  results.push(
    ...lineItemFixedPrices
      .filter((lineItemFixedPrice) => {
        return !mergedLineItemIds.includes(lineItemFixedPrice.lineItemId);
      })
      .map((lineItemFixedPrice) => {
        return {
          action: 'setLineItemCustomType',
          lineItemId: lineItemFixedPrice.lineItemId,
          type: {
            key: 'lineItemCodesType',
          },
          fields: {
            coupon_fixed_price: lineItemFixedPrice.couponFixedPrice,
          },
        } as CartActionSetLineItemCustomType;
      }),
  );

  results.push(
    ...lineItems
      .filter((lineItem) => {
        return !mergedLineItemIds.includes(lineItem.id);
      })
      .map((lineItem) => {
        return {
          action: 'setLineItemCustomType',
          lineItemId: lineItem.id,
          type: {
            key: 'lineItemCodesType',
          },
        } as CartActionSetLineItemCustomType;
      }),
  );

  return results;
}

function removeFreeLineItemsForNonApplicableCoupon(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const cartActions: CartAction[] = [];
  const { productsToAdd } = validateCouponsResult;
  cart.lineItems
    .filter((item) => item.custom?.fields?.applied_codes)
    .filter((item) => {
      const isCouponWhichNoLongerExist = item.custom?.fields?.applied_codes
        .map((code) => JSON.parse(code))
        .filter((code) => code.type === 'UNIT')
        .find((code) =>
          productsToAdd.map((product) => product.code).includes(code.code),
        );

      return !isCouponWhichNoLongerExist;
    })
    .forEach((item) => {
      const quantityFromCode =
        item.custom?.fields.applied_codes
          .map((code) => JSON.parse(code))
          .filter((code) => code.type === 'UNIT')
          .find(
            (code) =>
              !productsToAdd
                .map((unitCode) => unitCode.code)
                .includes(code.code),
          )?.quantity ?? 0;

      if (item.quantity > quantityFromCode) {
        cartActions.push({
          action: 'setLineItemCustomField',
          lineItemId: item.id,
          name: 'applied_codes',
        });
      }

      if (item.quantity >= quantityFromCode) {
        cartActions.push({
          action: 'removeLineItem',
          lineItemId: item.id,
          quantity: quantityFromCode,
        });
      }
    });

  return cartActions;
}

export default function lineItemsAndTheirCustomFields(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartAction[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  if (!valid && onlyNewCouponsFailed) {
    return [];
  }

  const lineProductsWithFixedAmount =
    mapValidateCouponsResultToLineProductsWithFixedAmount(
      validateCouponsResult,
    );

  const fixedPrice = getLineItemCustomFieldActions(
    cart,
    lineProductsWithFixedAmount,
    validateCouponsResult.applicableCoupons,
  );

  const freeLineItemsActions = addFreeLineItems22(cart, validateCouponsResult);
  const test = addFreeLineItems(cart, validateCouponsResult);

  console.log('case 1 = ', freeLineItemsActions);
  console.log('case 2 = ', test);
  const mergedSetLineItemCustomTypeActions = mergeSetLineItemCustomType(
    cart.lineItems,
    fixedPrice,
    freeLineItemsActions.filter(
      (freeLineItem) => freeLineItem?.action === 'setLineItemCustomType',
    ) as CartActionSetLineItemCustomType[],
  );

  const removeActions = removeFreeLineItemsForNonApplicableCoupon(
    cart,
    validateCouponsResult,
  );

  return [
    ...removeActions,
    ...freeLineItemsActions.filter(
      (freeLineItem) => freeLineItem?.action !== 'setLineItemCustomType',
    ),
    ...mergedSetLineItemCustomTypeActions,
  ];
}
