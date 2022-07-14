import { Cart, TaxCategory, TypedMoney } from '@commercetools/platform-sdk';
import { Injectable } from '@nestjs/common';
import {
  DiscountVouchersEffectTypes,
  OrdersItem,
  StackableRedeemableResponse,
  StackableRedeemableResponseStatus,
  ValidationValidateStackableResponse,
} from '@voucherify/sdk';
import { JsonLogger, LoggerFactory } from 'json-logger-service';

import { TaxCategoriesService } from '../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../commerceTools/types/types.service';
import { VoucherifyConnectorService } from '../voucherify/voucherify-connector.service';
import { desarializeCoupons, Coupon, CouponStatus } from './coupon';

type CartActionSetCustomType = {
  action: 'setCustomType';
  name: 'couponCodes';
  type: {
    id: string;
  };
};

type CartActionSetCustomFieldWithCoupons = {
  action: 'setCustomField';
  name: 'discount_codes';
  value: string[];
};

type CartActionSetCustomFieldWithSession = {
  action: 'setCustomField';
  name: 'session';
  value: string;
};

type CartActionRemoveCustomLineItem = {
  action: 'removeCustomLineItem';
  customLineItemId: string;
};

type CartActionAddCustomLineItem = {
  action: 'addCustomLineItem';
  name: {
    en: string;
  };
  quantity: number;
  money: TypedMoney;
  slug: string;
  taxCategory: Pick<TaxCategory, 'id'>;
};

type CartActionAddLineItem = {
  action: 'addLineItem';
  sku: string;
  quantity: number;
  externalTotalPrice?: {
    price: TypedMoney;
    totalPrice: TypedMoney;
  };
  custom?: {
    typeKey: 'lineItemCodesType';
    fields: {
      applied_codes: string[];
    };
  };
};

type CartActionRemoveLineItem = {
  action: 'removeLineItem';
  lineItemId: string;
  quantity: number;
};

type CartActionSetLineItemCustomField = {
  action: 'setLineItemCustomField';
  lineItemId: string;
  name: string;
  value?: string;
};

type CartActionSetLineItemCustomType = {
  action: 'setLineItemCustomType';
  lineItemId: string;
  type: {
    key: 'lineItemCodesType';
  };
  fields: {
    applied_codes: string[];
  };
};

type CartActionChangeLineItemQuantity = {
  action: 'changeLineItemQuantity';
  lineItemId: string;
  quantity: number;
};

export type CartAction =
  | CartActionSetCustomType
  | CartActionSetCustomFieldWithCoupons
  | CartActionSetCustomFieldWithSession
  | CartActionRemoveCustomLineItem
  | CartActionAddCustomLineItem
  | CartActionAddLineItem
  | CartActionRemoveLineItem
  | CartActionSetLineItemCustomField
  | CartActionChangeLineItemQuantity
  | CartActionSetLineItemCustomType;

type CartResponse = { status: boolean; actions: CartAction[] };

type ProductToAdd = {
  code: string; // coupon code
  effect: DiscountVouchersEffectTypes;
  quantity?: number;
  discount_quantity?: number;
  initial_quantity: number;
  applied_discount_amount?: number;
  product: string; // sku source_id
};

type ValidateCouponsResult = {
  applicableCoupons: StackableRedeemableResponse[];
  notApplicableCoupons: StackableRedeemableResponse[];
  skippedCoupons: StackableRedeemableResponse[];
  newSessionKey?: string;
  valid: boolean;
  totalDiscountAmount: number;
  productsToAdd: ProductToAdd[];
  onlyNewCouponsFailed?: boolean;
  taxCategory?: TaxCategory;
};

type CartActionsBuilder = (
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
) => CartAction[];

function getSession(cart: Cart): string | null {
  return cart.custom?.fields?.session ?? null;
}

type SessionValidateResult = Pick<
  ValidateCouponsResult,
  'valid' | 'newSessionKey'
>;
function setSessionAsCustomField(
  cart: Cart,
  { valid, newSessionKey }: SessionValidateResult,
): CartActionSetCustomFieldWithSession[] {
  const sessionKey = getSession(cart);
  if (!valid || !newSessionKey || newSessionKey === sessionKey) {
    return [];
  }
  return [
    {
      action: 'setCustomField',
      name: 'session',
      value: newSessionKey,
    },
  ];
}

const COUPON_CUSTOM_LINE_NAME_PREFIX = 'Voucher, ';

function removeDiscountedCustomLineItems(
  cart: Cart,
): CartActionRemoveCustomLineItem[] {
  return (cart.customLineItems || [])
    .filter((lineItem) =>
      lineItem.name.en.startsWith(COUPON_CUSTOM_LINE_NAME_PREFIX),
    )
    .map(
      (lineItem) =>
        ({
          action: 'removeCustomLineItem',
          customLineItemId: lineItem.id,
        } as CartActionRemoveCustomLineItem),
    );
}

// TODO don't create addCustomLineItem action if the summary doesn't actually change
function addCustomLineItemWithDiscountSummary(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionAddCustomLineItem[] {
  const { totalDiscountAmount, applicableCoupons, taxCategory } =
    validateCouponsResult;

  if (applicableCoupons.length === 0) return [];
  const { currencyCode } = cart.totalPrice;
  const couponCodes = applicableCoupons.map((coupon) => coupon.id).join(', ');

  return [
    {
      action: 'addCustomLineItem',
      name: {
        en: `${COUPON_CUSTOM_LINE_NAME_PREFIX}coupon value => ${(
          totalDiscountAmount / 100
        ).toFixed(2)}`,
      },
      quantity: 1,
      money: {
        centAmount: totalDiscountAmount ? -totalDiscountAmount : 0,
        type: 'centPrecision',
        currencyCode,
      },
      slug: couponCodes,
      taxCategory: {
        id: taxCategory.id,
      },
    } as CartActionAddCustomLineItem,
  ];
}

type ValidatedProductsToAdd = Pick<ValidateCouponsResult, 'productsToAdd'>;
function addFreeLineItems(
  cart: Cart,
  { productsToAdd }: ValidatedProductsToAdd,
): CartAction[] {
  const cartActions = [] as CartAction[];
  const findLineItemRelatedTo = (product: ProductToAdd) =>
    cart.lineItems.find((item) =>
      item.custom?.fields?.applied_codes?.map(
        (applied) => JSON.parse(applied).code === product.code,
      ),
    );
  const findLineItemBySku = (sku: string) =>
    cart.lineItems.find((item) => item.variant.sku === sku);
  const convertToAppliedCode = (
    product: ProductToAdd,
    quantity: number,
    totalDiscountQuantity: number,
  ) =>
    JSON.stringify({
      code: product.code,
      type: 'UNIT',
      effect: product.effect,
      quantity,
      totalDiscountQuantity,
    });

  productsToAdd
    .filter((product) => product.effect === 'ADD_NEW_ITEMS')
    .filter((product) => {
      const item = findLineItemRelatedTo(product);
      return !item || item.quantity < product.quantity;
    })
    .forEach((product) => {
      const item = findLineItemBySku(product.product);

      if (item) {
        cartActions.push({
          action: 'changeLineItemQuantity',
          lineItemId: item.id,
          quantity: item.quantity + product.quantity,
        });

        const appliedCode = convertToAppliedCode(
          product,
          product.quantity,
          product.quantity,
        );
        cartActions.push({
          action: 'setLineItemCustomType',
          lineItemId: item.id,
          type: {
            key: 'lineItemCodesType',
          },
          fields: {
            applied_codes: [appliedCode],
          },
        });
      } else {
        const appliedCode = convertToAppliedCode(
          product,
          product.quantity,
          product.quantity,
        );

        cartActions.push({
          action: 'addLineItem',
          sku: product.product,
          quantity: product.quantity,
          custom: {
            typeKey: 'lineItemCodesType',
            fields: {
              applied_codes: [appliedCode],
            },
          },
        });
      }
    });

  productsToAdd
    .filter((product) => product.effect === 'ADD_MISSING_ITEMS')
    .filter((product) => {
      const item = findLineItemRelatedTo(product);
      return !item || item.quantity < product.discount_quantity;
    })
    .forEach((product) => {
      const item = findLineItemBySku(product.product);

      if (item) {
        const quantity =
          item.quantity >= product.discount_quantity
            ? item.quantity
            : product.discount_quantity;
        const appliedCodeQuantity =
          item.quantity >= product.discount_quantity ? 0 : item.quantity;

        cartActions.push({
          action: 'changeLineItemQuantity',
          lineItemId: item.id,
          quantity,
        });

        const appliedCode = convertToAppliedCode(
          product,
          appliedCodeQuantity,
          product.discount_quantity,
        );
        cartActions.push({
          action: 'setLineItemCustomType',
          lineItemId: item.id,
          type: {
            key: 'lineItemCodesType',
          },
          fields: {
            applied_codes: [appliedCode],
          },
        });
      } else {
        const appliedCode = convertToAppliedCode(
          product,
          product.discount_quantity - product.initial_quantity,
          product.discount_quantity,
        );

        cartActions.push({
          action: 'addLineItem',
          sku: product.product,
          quantity: product.discount_quantity - product.initial_quantity,
          custom: {
            typeKey: 'lineItemCodesType',
            fields: {
              applied_codes: [appliedCode],
            },
          },
        });
      }
    });

  return cartActions;
}

function removeFreeLineItemsForNonApplicableCoupon(
  cart: Cart,
  { productsToAdd }: ValidatedProductsToAdd,
): CartAction[] {
  const cartActions: CartAction[] = [];
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
      const quantityFromCode = item.custom?.fields.applied_codes
        .map((code) => JSON.parse(code))
        .filter((code) => code.type === 'UNIT')
        .find(
          (code) =>
            !productsToAdd.map((unitCode) => unitCode.code).includes(code.code),
        ).quantity;

      if (item.quantity > quantityFromCode) {
        cartActions.push({
          action: 'setLineItemCustomField',
          lineItemId: item.id,
          name: 'applied_codes',
        });
      }

      cartActions.push({
        action: 'removeLineItem',
        lineItemId: item.id,
        quantity: quantityFromCode,
      });
    });

  return cartActions;
}

function updateDiscountsCodes(
  cart: Cart,
  validateCouponsResult: ValidateCouponsResult,
): CartActionSetCustomFieldWithCoupons[] {
  const {
    applicableCoupons,
    notApplicableCoupons,
    skippedCoupons,
    onlyNewCouponsFailed,
  } = validateCouponsResult;
  const oldCouponsCodes: Coupon[] = (
    cart.custom?.fields?.discount_codes ?? []
  ).map(desarializeCoupons);

  const coupons = [
    ...applicableCoupons.map(
      (coupon) =>
        ({
          code: coupon.id,
          status: 'APPLIED',
          value:
            coupon.order?.applied_discount_amount ||
            coupon.order?.items_applied_discount_amount ||
            coupon.result?.discount?.amount_off ||
            oldCouponsCodes.find((oldCoupon) => coupon.id === oldCoupon.code)
              ?.value ||
            0,
        } as Coupon),
    ),
    ...notApplicableCoupons.map(
      (coupon) =>
        ({
          code: coupon.id,
          status: 'NOT_APPLIED',
          errMsg: coupon.result?.error?.error?.message
            ? coupon.result?.error?.error.message
            : coupon.result?.error?.message,
        } as Coupon),
    ),
  ];

  if (onlyNewCouponsFailed) {
    coupons.push(
      ...skippedCoupons.map(
        (coupon) =>
          ({
            code: coupon.id,
            status: 'APPLIED',
            value:
              oldCouponsCodes.find((oldCoupon) => coupon.id === oldCoupon.code)
                ?.value || 0,
          } as Coupon),
      ),
    );
  }

  return [
    {
      action: 'setCustomField',
      name: 'discount_codes',
      value: coupons.map((coupon) => JSON.stringify(coupon)) as string[],
    },
  ];
}

function getCartActionBuilders(
  validateCouponsResult: ValidateCouponsResult,
): CartActionsBuilder[] {
  const { valid, onlyNewCouponsFailed } = validateCouponsResult;

  const cartActionBuilders = [setSessionAsCustomField] as CartActionsBuilder[];
  if (valid || !onlyNewCouponsFailed) {
    cartActionBuilders.push(
      ...[
        removeDiscountedCustomLineItems,
        addCustomLineItemWithDiscountSummary,
        addFreeLineItems,
        removeFreeLineItemsForNonApplicableCoupon,
      ],
    );
  }
  cartActionBuilders.push(updateDiscountsCodes);

  return cartActionBuilders;
}

// TODO: to delete once @voucherify/sdk is being updated
interface ExtendedOrdersItem extends OrdersItem {
  initial_quantity?: number;
  applied_discount_amount?: number;
  discount_quantity?: number;
  product?: {
    source_id: string;
    override?: boolean;
    name?: string;
    metadata?: Record<string, any>;
  };
}

function convertUnitTypeCouponsToFreeProducts(
  response: ValidationValidateStackableResponse,
): ProductToAdd[] {
  return response.redeemables
    ?.filter((redeemable) => redeemable.result?.discount?.type === 'UNIT')
    .flatMap((unitTypeRedeemable) => {
      const freeItem = unitTypeRedeemable.order?.items?.find(
        (item: ExtendedOrdersItem) =>
          item.product?.source_id ===
          unitTypeRedeemable.result?.discount?.product?.source_id,
      ) as ExtendedOrdersItem;
      const { effect: discountEffect } = unitTypeRedeemable.result?.discount;
      if (['ADD_NEW_ITEMS', 'ADD_MISSING_ITEMS'].includes(discountEffect)) {
        return [
          {
            code: unitTypeRedeemable.id,
            effect: unitTypeRedeemable.result?.discount?.effect,
            quantity: unitTypeRedeemable.result?.discount?.unit_off,
            product: unitTypeRedeemable.result?.discount.sku.source_id,
            initial_quantity: freeItem?.initial_quantity,
            discount_quantity: freeItem?.discount_quantity,
            applied_discount_amount: freeItem?.applied_discount_amount,
          },
        ];
      }

      if (discountEffect === 'ADD_MANY_ITEMS') {
        return unitTypeRedeemable.result.discount.units
          .filter((product) =>
            ['ADD_NEW_ITEMS', 'ADD_MISSING_ITEMS'].includes(product.effect),
          )
          .map((product) => {
            const freeItem = unitTypeRedeemable.order?.items?.find(
              (item: ExtendedOrdersItem) =>
                item.product.source_id === product.product.source_id,
            ) as ExtendedOrdersItem;
            return {
              code: unitTypeRedeemable.id,
              effect: product.effect,
              quantity: product.unit_off,
              product: product.sku.source_id,
              initial_quantity: freeItem.initial_quantity,
              discount_quantity: freeItem.discount_quantity,
              applied_discount_amount: freeItem.applied_discount_amount,
            };
          });
      }
      return [];
    });
}

function getCouponsFromCart(cart: Cart): Coupon[] {
  return (cart.custom?.fields?.discount_codes ?? [])
    .map(desarializeCoupons)
    .filter((coupon) => coupon.status !== 'NOT_APPLIED'); // we already declined them, will be removed by frontend
}

function checkCouponsValidatedAsState(
  coupons: Coupon[],
  validatedCoupons: StackableRedeemableResponse[],
  status: CouponStatus,
): boolean {
  return (
    validatedCoupons.length === 0 ||
    coupons
      .filter((coupon) => coupon.status === status)
      .every((coupon) =>
        validatedCoupons.find((element) => element.id === coupon.code),
      )
  );
}

function checkIfOnlyNewCouponsFailed(
  coupons: Coupon[],
  applicableCoupons: StackableRedeemableResponse[],
  notApplicableCoupons: StackableRedeemableResponse[],
  skippedCoupons: StackableRedeemableResponse[],
): boolean {
  const areAllNewCouponsNotApplicable = checkCouponsValidatedAsState(
    coupons,
    notApplicableCoupons,
    'NEW',
  );

  const areAllAppliedCouponsApplicable = checkCouponsValidatedAsState(
    coupons,
    applicableCoupons,
    'APPLIED',
  );

  const areAllAppliedCouponsSkipped = checkCouponsValidatedAsState(
    coupons,
    skippedCoupons,
    'APPLIED',
  );

  return (
    notApplicableCoupons.length !== 0 &&
    areAllNewCouponsNotApplicable &&
    areAllAppliedCouponsSkipped &&
    areAllAppliedCouponsApplicable
  );
}

@Injectable()
export class CartService {
  constructor(
    private readonly taxCategoriesService: TaxCategoriesService,
    private readonly typesService: TypesService,
    private readonly voucherifyConnectorService: VoucherifyConnectorService,
  ) {}
  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    CartService.name,
  );

  private async validateCoupons(
    cart: Cart,
    sessionKey?: string | null,
  ): Promise<ValidateCouponsResult> {
    const { id, customerId, anonymousId } = cart;
    const coupons: Coupon[] = getCouponsFromCart(cart);
    const taxCategory = await this.checkCouponTaxCategoryWithCountries(cart);

    if (!coupons.length) {
      this.logger.debug({
        msg: 'No coupons applied, skipping voucherify call',
      });

      return {
        valid: false,
        applicableCoupons: [],
        notApplicableCoupons: [],
        skippedCoupons: [],
        productsToAdd: [],
        totalDiscountAmount: 0,
      };
    }
    this.logger.info({
      msg: 'Attempt to apply coupons',
      coupons,
      id,
      customerId,
      anonymousId,
    });

    const validatedCoupons =
      await this.voucherifyConnectorService.validateStackableVouchersWithCTCart(
        coupons.map((coupon) => coupon.code),
        cart,
        sessionKey,
      );

    const getCouponsByStatus = (status: StackableRedeemableResponseStatus) =>
      validatedCoupons.redeemables.filter(
        (redeemable) => redeemable.status === status,
      );
    const notApplicableCoupons = getCouponsByStatus('INAPPLICABLE');
    const skippedCoupons = getCouponsByStatus('SKIPPED');
    const applicableCoupons = getCouponsByStatus('APPLICABLE');

    const sessionKeyResponse = validatedCoupons.session?.key;
    const { valid } = validatedCoupons;
    const totalDiscountAmount =
      validatedCoupons.order?.total_discount_amount ?? 0;

    const productsToAdd =
      convertUnitTypeCouponsToFreeProducts(validatedCoupons);

    const onlyNewCouponsFailed = checkIfOnlyNewCouponsFailed(
      coupons,
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
    );

    this.logger.info({
      msg: 'Validated coupons',
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      id,
      valid,
      customerId,
      sessionKey,
      sessionKeyResponse,
      totalDiscountAmount,
      productsToAdd,
      onlyNewCouponsFailed,
      taxCategory,
    });
    const newSessionKey = !sessionKey || valid ? sessionKeyResponse : null;

    return {
      applicableCoupons,
      notApplicableCoupons,
      skippedCoupons,
      newSessionKey,
      valid,
      totalDiscountAmount,
      productsToAdd,
      onlyNewCouponsFailed,
      taxCategory,
    };
  }

  private async checkCouponTaxCategoryWithCountries(cart: Cart) {
    const { country } = cart;
    const taxCategory = await this.taxCategoriesService.getCouponTaxCategory();
    if (!taxCategory) {
      const msg = 'Coupon tax category was not configured correctly';
      this.logger.error({ msg });
      throw new Error(msg);
    }

    if (
      country &&
      !taxCategory?.rates?.find((rate) => rate.country === country)
    ) {
      await this.taxCategoriesService.addCountryToCouponTaxCategory(
        taxCategory,
        country,
      );
    }

    return taxCategory;
  }

  private async setCustomTypeForInitializedCart(): Promise<CartResponse> {
    const couponType = await this.typesService.findCouponType('couponCodes');
    if (!couponType) {
      const msg = 'CouponType not found';
      this.logger.error({ msg });
      throw new Error(msg);
    }

    return {
      status: true,
      actions: [
        {
          action: 'setCustomType',
          type: {
            id: couponType.id,
          },
          name: 'couponCodes',
        },
      ],
    };
  }

  async checkCartAndMutate(cart: Cart): Promise<CartResponse> {
    if (cart.version === 1) {
      return this.setCustomTypeForInitializedCart();
    }

    const sessionKey = getSession(cart);
    const validateCouponsResult = await this.validateCoupons(cart, sessionKey);

    const actions = getCartActionBuilders(validateCouponsResult).flatMap(
      (builder) => builder(cart, validateCouponsResult),
    );

    this.logger.info(actions);
    return {
      status: true,
      actions,
    };
  }
}
