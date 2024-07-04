import {
  IsArray,
  IsDefined,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  Cart,
  CartDiscountReference,
  CartOrigin,
  CartState,
  CustomFields,
  CustomLineItem,
  FieldContainer,
  LineItem,
  Order,
  OrderState,
  PaymentState,
  RoundingMode,
  SyncInfo,
  TaxCalculationMode,
  TaxMode,
  TypedMoney,
  TypeReference,
} from '@commercetools/platform-sdk';
import { Type } from 'class-transformer';
import { CustomerGroupReference } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/customer-group';

export class FC implements FieldContainer {
  @IsArray()
  @IsOptional()
  public discount_codes?: string[];
}

export class Custom implements CustomFields {
  public type: TypeReference;

  @IsDefined()
  @ValidateNested()
  @Type(() => FC)
  public fields: FC;
}

export class CartObj implements Cart {
  public id: string;
  public createdAt: string;
  public lastModifiedAt: string;
  public cartState: CartState;
  public taxMode: TaxMode;
  public taxCalculationMode: TaxCalculationMode;
  public taxRoundingMode: RoundingMode;
  public refusedGifts: CartDiscountReference[];
  public origin: CartOrigin;
  public version: number;
  public lineItems: LineItem[];
  public customLineItems: CustomLineItem[];
  public totalPrice: TypedMoney;
  public customerGroup: CustomerGroupReference;
}

export class OrderObj implements Order {
  public id: string;
  public createdAt: string;
  public lastModifiedAt: string;
  public version: number;
  public cartState: CartState;
  public taxMode: TaxMode;
  public taxCalculationMode: TaxCalculationMode;
  public taxRoundingMode: RoundingMode;
  public refusedGifts: CartDiscountReference[];
  public origin: CartOrigin;
  public lineItems: LineItem[];
  public customLineItems: CustomLineItem[];
  public totalPrice: TypedMoney;
  public orderState: OrderState;
  public syncInfo: SyncInfo[];
  public lastMessageSequenceNumber: number;

  @IsString()
  @IsOptional()
  public paymentState?: PaymentState;

  @IsOptional()
  @ValidateNested()
  @Type(() => Custom)
  public custom: Custom;
}

export class Resource {
  @IsIn(['order', 'cart'])
  @IsDefined()
  @IsString()
  public typeId: 'order' | 'cart';

  @IsDefined()
  @ValidateNested()
  @Type(({ object }) => (object.typeId === 'order' ? OrderObj : CartObj))
  public obj: OrderObj | CartObj;
}

export class CartOrderDto {
  @ValidateNested()
  @Type(() => Resource)
  public resource: Resource;

  @IsString()
  public action: string;
}
