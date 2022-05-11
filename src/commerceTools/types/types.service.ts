import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { Type } from '@commercetools/platform-sdk';

@Injectable()
export class TypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  async getAllTypes(): Promise<Type[]> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 20;
    const allTypes = [];
    let page = 0;
    let allTypesCollected = false;

    do {
      const typesResult = await ctClient
        .types()
        .get({ queryArgs: { limit: limit, offset: page * limit } })
        .execute();
      allTypes.push(...typesResult.body.results);
      page++;
      if (typesResult.body.total < page * limit) {
        allTypesCollected = true;
      }
    } while (!allTypesCollected);

    return allTypes.flat();
  }

  async findCouponType(): Promise<Type | null> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const limit = 20;
    let page = 0;
    let allTypesCollected = false;

    do {
      const typesResult = await ctClient
        .types()
        .get({ queryArgs: { limit: limit, offset: page * limit } })
        .execute();
      const couponType = typesResult.body.results.find(
        (type) => type.key === 'couponCodes',
      );
      if (couponType?.id) return couponType;
      page++;
      if (typesResult.body.total < page * limit) {
        allTypesCollected = true;
      }
    } while (!allTypesCollected);

    return null;
  }

  async configureCouponType(): Promise<{ success: boolean; type: any }> {
    const couponType = await this.findCouponType();
    if (couponType) {
      return { success: true, type: couponType };
    }
    const newCouponType = this.createCouponType();
    return { success: true, type: newCouponType };
  }

  async createCouponType() {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const response = await ctClient
      .types()
      .post({
        body: {
          key: 'couponCodes', //DO NOT CHANGE the key
          name: {
            en: 'couponCodes',
          },
          description: {
            en: 'couponCodes',
          },
          resourceTypeIds: ['order'],
          fieldDefinitions: [
            {
              name: 'discount_codes',
              label: {
                en: 'discount_codes',
              },
              required: false,
              type: {
                name: 'Set',
                elementType: { name: 'String' },
              },
              inputHint: 'SingleLine',
            },
          ],
        },
      })
      .execute();
    if (response.statusCode === 201) {
      return response.body;
    }
    throw new Error('couponCodes type cannot be created');
  }
}
