import {
  Cart,
  CartOrigin,
  CartState,
  RoundingMode,
  TaxCalculationMode,
  TaxMode,
  TypedMoney,
} from '@commercetools/platform-sdk';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../cart.service';
import { TaxCategoriesService } from '../../commerceTools/tax-categories/tax-categories.service';
import { TypesService } from '../../commerceTools/types/types.service';
import { VoucherifyConnectorService } from '../../voucherify/voucherify-connector.service';

jest.mock('../../commerceTools/tax-categories/tax-categories.service');
jest.mock('../../commerceTools/types/types.service');
jest.mock('../../voucherify/voucherify-connector.service');

describe('CartService', () => {
  let cartService: CartService;
  let taxCategoriesService: TaxCategoriesService;
  let typesService: TypesService;
  let voucherifyConnectorService: VoucherifyConnectorService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: TaxCategoriesService,
          useValue: TaxCategoriesService,
        },
        {
          provide: TypesService,
          useValue: TypesService,
        },
        {
          provide: VoucherifyConnectorService,
          useValue: VoucherifyConnectorService,
        },
      ],
    }).compile();

    cartService = app.get<CartService>(CartService);
    taxCategoriesService = app.get<TaxCategoriesService>(TaxCategoriesService);
    typesService = app.get<TypesService>(TypesService);
    voucherifyConnectorService = app.get<VoucherifyConnectorService>(
      VoucherifyConnectorService,
    );
  });

  describe('checkCartAndMutate', () => {
    it('should work ;-)', async () => {
      const cart: Cart = {
        id: 'cart-id',
        createdAt: new Date().toISOString(),
        version: 1,
        lastModifiedAt: new Date().toISOString(),
        lineItems: [],
        customLineItems: [],
        totalPrice: <TypedMoney>{},
        cartState: <CartState>{},
        taxMode: <TaxMode>{},
        taxRoundingMode: <RoundingMode>{},
        taxCalculationMode: <TaxCalculationMode>{},
        refusedGifts: [],
        origin: <CartOrigin>{},
      };

      const result = await cartService.checkCartAndMutate(cart);
      console.log(JSON.stringify(result, null, 2));

      expect(result).not.toBe(undefined);
      expect(result.status).toBe(true);
      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
      expect(typesService.findCouponType).toBeCalledTimes(1);
    });
  });
});
