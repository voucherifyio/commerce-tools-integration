import { Injectable } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import {
  Type,
  FieldDefinition,
  TypeUpdateAction,
} from '@commercetools/platform-sdk';
import { JsonLogger, LoggerFactory } from 'json-logger-service';

@Injectable()
export class TypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
  ) {}

  private readonly logger: JsonLogger = LoggerFactory.createLogger(
    TypesService.name,
  );

  async findCouponType(): Promise<Type | null> {
    return this.findType('couponCodes');
  }
  async findType(typeName: string): Promise<Type | null> {
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
        (type) => type.key === typeName,
      );
      if (couponType?.id) return couponType;
      page++;
      if (typesResult.body.total < page * limit) {
        allTypesCollected = true;
      }
    } while (!allTypesCollected);

    return null;
  }

  couponsFieldsDefinitions: FieldDefinition[] = [
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
    {
      name: 'session',
      label: {
        en: 'session',
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'SingleLine',
    },
  ];

  async configureCouponType(): Promise<{ success: boolean; type: Type }> {
    this.logger.info({
      msg: 'Attempt to configure custom field type for order that keeps information about coupon codes.',
    });
    const couponType = await this.findCouponType();
    if (!couponType) {
      this.logger.info({
        msg: 'No custom field type, creating new one from scratch.',
      });
      return { success: true, type: await this.createCouponType() };
    }
    const missingFields = this.couponsFieldsDefinitions.filter(
      (fieldDefinition) =>
        !couponType.fieldDefinitions.some(
          (field) => field.name === fieldDefinition.name,
        ),
    );

    if (missingFields.length) {
      this.logger.info({
        msg: 'We have custom couponCodes type registered but fields are outdated. We are going to update custom field type',
        missingFields,
      });
      const actions: TypeUpdateAction[] = missingFields.map(
        (fieldDefinition) => ({
          action: 'addFieldDefinition',
          fieldDefinition,
        }),
      );
      return {
        success: true,
        type: await this.updateCouponType(couponType, actions),
      };
    }
    this.logger.info({
      msg: 'Custom field type and fields are up to date.',
    });

    return {
      success: true,
      type: couponType,
    };
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
          fieldDefinitions: this.couponsFieldsDefinitions,
        },
      })
      .execute();
    if ([200, 201].includes(response.statusCode)) {
      this.logger.info({
        msg: 'Type: "couponCodes" created',
        type: response.body,
      });
      return response.body;
    }
    const errorMsg = 'Type: "couponCodes" could not be created';
    this.logger.error({
      msg: errorMsg,
      statusCode: response.statusCode,
      body: response.body,
    });
    throw new Error(errorMsg);
  }

  async updateCouponType(oldCouponType: Type, actions: TypeUpdateAction[]) {
    const ctClient = this.commerceToolsConnectorService.getClient();

    const response = await ctClient
      .types()
      .withId({ ID: oldCouponType.id })
      .post({
        body: {
          version: oldCouponType.version,
          actions,
        },
      })
      .execute();

    if ([200, 201].includes(response.statusCode)) {
      this.logger.info({
        msg: 'Type: "couponCodes" updated',
        type: response.body,
      });
      return response.body;
    }
    const errorMsg = 'Type: "couponCodes" could not be updated';

    this.logger.error({
      msg: errorMsg,
      statusCode: response.statusCode,
      body: response.body,
    });
    throw new Error(errorMsg);
  }
}
