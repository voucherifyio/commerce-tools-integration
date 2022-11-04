import { OrdersItem } from '@voucherify/sdk';
import { LineItem } from '@commercetools/platform-sdk';

export class ProductMapper {
  public getMetadata(attributes, metadataSchemaProperties) {
    return attributes
      ? Object.fromEntries(
          attributes
            .filter((attr) => metadataSchemaProperties.includes(attr.name))
            .map((attr) => [attr.name, attr.value]),
        )
      : {};
  }

  public mapLineItems(
    lineItems: LineItem[],
    metadataSchemaProperties = [],
  ): OrdersItem[] {
    return lineItems
      .filter((item) => this.getQuantity(item) > 0)
      .map((item) => {
        return {
          source_id: item?.variant?.sku,
          related_object: 'sku' as 'sku' | 'product',
          quantity: this.getQuantity(item),
          price: item.price.value.centAmount,
          amount: item.price.value.centAmount * this.getQuantity(item),
          product: {
            override: true,
            name: Object?.values(item.name)?.[0],
          },
          sku: {
            override: true,
            sku: Object?.values(item.name)?.[0],
            metadata: metadataSchemaProperties
              ? this.getMetadata(
                  item?.variant.attributes,
                  metadataSchemaProperties,
                )
              : {},
          },
        };
      });
  }

  private getQuantity(item) {
    const custom = item.custom?.fields?.applied_codes;
    let itemQuantity = item?.quantity;

    if (custom) {
      custom
        .map((code) => JSON.parse(code))
        .filter(
          (code) => code.type === 'UNIT' && code.effect !== 'ADD_MISSING_ITEMS',
        )
        .forEach(
          (code) => (itemQuantity = itemQuantity - code.totalDiscountQuantity),
        );
    }
    return itemQuantity;
  }
}
