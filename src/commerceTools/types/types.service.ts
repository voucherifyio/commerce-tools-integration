import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { Type } from '@commercetools/platform-sdk';

@Injectable()
export class TypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  async getAllTypes(): Promise<Type[]> {
    const CT = this.commerceToolsConnectorService.getClient();
    const limit = 20;
    let allTypes = [];
    const typesResult = await CT.types()
      .get({ queryArgs: { limit: limit } })
      .execute();
    const total = typesResult.body.total;
    allTypes = [...allTypes, typesResult.body.results];
    if (total > limit) {
      for (let i = 1; i <= Math.ceil(total / limit); i++) {
        const typesResult = await CT.types()
          .get({ queryArgs: { limit: limit, offset: i * limit } })
          .execute();
        allTypes = [...allTypes, typesResult.body.results];
      }
    }
    return allTypes.flat();
  }

  async findCouponType(): Promise<{ found: boolean; type?: Type }> {
    const CT = this.commerceToolsConnectorService.getClient();
    const limit = 20;
    const typesResult = await CT.types()
      .get({ queryArgs: { limit: limit } })
      .execute();
    const total = typesResult.body.total;
    const couponType = typesResult.body.results.find(
      (type) => type.key === 'couponCodes',
    );
    if (couponType) return { found: true, type: couponType };
    if (total > limit) {
      for (let i = 1; i <= Math.ceil(total / limit); i++) {
        const typesResult = await CT.types()
          .get({ queryArgs: { limit: limit, offset: i * limit } })
          .execute();
        const couponType = typesResult.body.results.find(
          (type) => type.key === 'couponCodes',
        );
        if (couponType) return { found: true, type: couponType };
      }
    }
    return { found: false };
  }

  async configureCouponType() {
    const couponTypeSearchResult = await this.findCouponType();
    if (couponTypeSearchResult.found) {
      return { success: true, type: couponTypeSearchResult.type };
    }
    const couponType = this.createCouponType();
    return { success: true, type: couponType };
  }

  async createCouponType() {
    const CT = this.commerceToolsConnectorService.getClient();
    return await CT.types()
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
  }
}
