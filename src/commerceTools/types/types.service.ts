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
    if (couponType.fieldDefinitions.length === 2) {
      return { success: true, type: couponType };
    } else if (
      couponType.fieldDefinitions.length === 1 &&
      couponType.fieldDefinitions[0].name === 'discount_codes'
    ) {
      const newCouponType = this.createCouponType(couponType, 'used_codes');
      return { success: true, type: newCouponType };
    } else if (
      couponType.fieldDefinitions.length === 1 &&
      couponType.fieldDefinitions[0].name === 'used_codes'
    ) {
      const newCouponType = this.createCouponType(couponType, 'discount_codes');
      return { success: true, type: newCouponType };
    }
    const newCouponType = this.createCouponType();
    return { success: true, type: newCouponType };
  }

  async createCouponType(oldCouponType?: Type, newCouponField?: string) {
    const ctClient = this.commerceToolsConnectorService.getClient();
    if (oldCouponType && newCouponField) {
      const response = await ctClient
        .types()
        .withId({ ID: oldCouponType.id })
        .post({
          body: {
            version: oldCouponType.version,
            actions: [
              {
                action: 'addFieldDefinition',
                fieldDefinition: {
                  name: 'used_codes',
                  label: {
                    en: 'used_codes',
                  },
                  required: false,
                  type: {
                    name: 'Set',
                    elementType: { name: 'String' },
                  },
                  inputHint: 'SingleLine',
                },
              },
            ],
          },
        })
        .execute();

      if (response.statusCode === 201) {
        return response.body;
      }
      throw new Error('couponCodes type cannot be updated');
    } else {
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
              {
                name: 'used_codes',
                label: {
                  en: 'used_codes',
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
}
