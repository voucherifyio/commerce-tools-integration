import { Injectable, Logger } from '@nestjs/common';
import { CommerceToolsConnectorService } from '../commerce-tools-connector.service';
import { Type, TypeUpdateAction } from '@commercetools/platform-sdk';

@Injectable()
export class TypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommerceToolsConnectorService,
    private readonly logger: Logger,
  ) {}

  async findCouponType(typeName: string): Promise<Type | null> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const response = await ctClient
      .types()
      .get({ queryArgs: { where: `key="${typeName}"` } })
      .execute();
    if (
      ![200, 201].includes(response.statusCode) ||
      response.body.count === 0
    ) {
      this.logger.debug({ msg: `${typeName} type not found` });
      return null;
    }
    const couponType = response.body.results[0];
    this.logger.debug({ msg: `${typeName} type found`, id: couponType.id });
    return couponType;
  }

  couponCodesDefinition = {
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
        {
          name: 'shippingProductSourceIds',
          label: {
            en: 'shippingProductSourceIds',
          },
          required: false,
          type: {
            name: 'Set',
            elementType: { name: 'String' },
          },
          inputHint: 'SingleLine',
        },
        {
          name: 'isValidationFailed',
          label: {
            en: 'isValidationFailed',
          },
          required: false,
          type: {
            name: 'Boolean',
          },
          inputHint: 'SingleLine',
        },
        {
          name: 'couponsLimit',
          label: {
            en: 'couponsLimit',
          },
          required: false,
          type: {
            name: 'Number',
          },
          inputHint: 'SingleLine',
        },
      ],
    },
  };

  lineItemCodesDefinition = {
    body: {
      key: 'lineItemCodesType', //DO NOT CHANGE the key
      name: {
        en: 'lineItemCodesType',
      },
      description: {
        en: 'lineItemCodesType',
      },
      resourceTypeIds: ['line-item'],
      fieldDefinitions: [
        {
          name: 'applied_codes',
          label: {
            en: 'applied_codes',
          },
          required: false,
          type: {
            name: 'Set',
            elementType: { name: 'String' },
          },
          inputHint: 'SingleLine',
        },
        {
          name: 'coupon_fixed_price',
          label: {
            en: 'coupon_fixed_price',
          },
          required: false,
          type: {
            name: 'Number',
          },
          inputHint: 'SingleLine',
        },
      ],
    },
  };

  async configureCouponType(
    typeDefinition,
  ): Promise<{ success: boolean; type: Type }> {
    this.logger.debug({
      msg: 'Attempt to configure custom field type for order that keeps information about coupon codes.',
    });
    const couponType = await this.findCouponType(typeDefinition.body.key);
    if (!couponType) {
      this.logger.debug({
        msg: 'No custom field type, creating new one from scratch.',
      });
      return {
        success: true,
        type: await this.createCouponType(typeDefinition),
      };
    }
    const missingFields = typeDefinition.body.fieldDefinitions.filter(
      (fieldDefinition) =>
        !couponType.fieldDefinitions.some(
          (field) => field.name === fieldDefinition.name,
        ),
    );

    if (missingFields.length) {
      this.logger.debug({
        msg: `We have custom ${typeDefinition.body.key} type registered but fields are outdated. We are going to update custom field type`,
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
    this.logger.debug({
      msg: 'Custom field type and fields are up to date.',
    });

    return {
      success: true,
      type: couponType,
    };
  }

  async configureCouponTypes(): Promise<{ success: boolean }> {
    const orderConfig = await this.configureCouponType(
      this.couponCodesDefinition,
    );
    const productConfig = await this.configureCouponType(
      this.lineItemCodesDefinition,
    );

    if (orderConfig.success && productConfig.success) {
      this.logger.debug({
        msg: 'All types are configured properly',
      });
      return { success: true };
    } else {
      this.logger.debug({
        msg: 'Types are not configured properly',
      });
      return { success: false };
    }
  }

  async createCouponType(typeDefinition) {
    const ctClient = this.commerceToolsConnectorService.getClient();

    const response = await ctClient.types().post(typeDefinition).execute();
    if ([200, 201].includes(response.statusCode)) {
      this.logger.debug({
        msg: `Type: "${typeDefinition.body.key}" created`,
        type: response.body,
      });
      return response.body;
    }
    const errorMsg = `Type: "${typeDefinition.body.key}" could not be created`;
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
      this.logger.debug({
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
