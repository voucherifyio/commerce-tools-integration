import { Injectable, Logger } from '@nestjs/common';
import { CommercetoolsConnectorService } from '../commercetools-connector.service';
import { Type, TypeDraft, TypeUpdateAction } from '@commercetools/platform-sdk';
import {
  LINE_ITEM_COUPON_CUSTOM_FIELDS,
  ORDER_COUPON_CUSTOM_FIELDS,
} from './coupon-type-definition';

@Injectable()
export class CustomTypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly logger: Logger,
  ) {}

  //couponTypes should never change, so we can cache them
  private couponTypes = new Map<string, Type>();

  public async findCouponType(typeName: string): Promise<Type> {
    if (this.couponTypes.get(typeName)) {
      return this.couponTypes.get(typeName);
    }
    const ctClient = this.commerceToolsConnectorService.getClient();
    const response = await ctClient
      .types()
      .get({ queryArgs: { where: `key="${typeName}"` } })
      .execute()
      .catch((result) => result);
    if (
      ![200, 201].includes(response.statusCode) ||
      response.body?.count === 0
    ) {
      const msg = 'CouponType not found';
      this.logger.error({ msg });
      throw new Error(msg);
    }
    const couponType = response.body.results[0];
    this.logger.debug({ msg: `couponCodes type found`, id: couponType.id });
    this.couponTypes.set(typeName, couponType);
    return couponType;
  }

  public async configureCouponTypes(): Promise<{ success: boolean }> {
    const { success: orderConfigured } = await this.upsertCouponType(
      ORDER_COUPON_CUSTOM_FIELDS,
    );
    const { success: productConfigured } = await this.upsertCouponType(
      LINE_ITEM_COUPON_CUSTOM_FIELDS,
    );

    const isSuccess = orderConfigured && productConfigured;
    this.logger.debug({
      msg: isSuccess
        ? 'All custom-types are configured properly'
        : 'Types are not configured properly',
    });

    return { success: isSuccess };
  }

  public async unconfigureCouponTypes(): Promise<{ success: boolean }> {
    const { success: orderConfig } = await this.deleteCouponType(
      ORDER_COUPON_CUSTOM_FIELDS,
    );
    const { success: productConfig } = await this.deleteCouponType(
      LINE_ITEM_COUPON_CUSTOM_FIELDS,
    );

    const isSuccess = orderConfig && productConfig;
    this.logger.debug({
      msg: isSuccess
        ? 'All custom-types are unconfigured properly'
        : 'Types are not unconfigured properly',
    });

    return { success: isSuccess };
  }

  private async upsertCouponType(
    typeDefinition: TypeDraft,
  ): Promise<{ success: boolean }> {
    this.logger.debug({
      msg: 'Attempt to configure custom field type for order that keeps information about coupon codes.',
    });

    const couponType = await this.findCouponType(typeDefinition.key).catch(
      () => undefined,
    );

    if (!couponType) {
      this.logger.debug({
        msg: 'No custom field type, creating new one from scratch.',
      });
      return await this.createCouponType(typeDefinition);
    }

    const missingFields = typeDefinition.fieldDefinitions.filter(
      (fieldDefinition) =>
        !couponType.fieldDefinitions.some(
          (field) => field.name === fieldDefinition.name,
        ),
    );

    if (missingFields.length === 0) {
      this.logger.debug({
        msg: 'Custom field type and fields are up to date.',
      });

      return { success: true };
    }

    this.logger.debug({
      msg: `We have custom ${typeDefinition.key} type registered but fields are outdated. We are going to update custom field type`,
      missingFields,
    });
    const actions: TypeUpdateAction[] = missingFields.map(
      (fieldDefinition) => ({
        action: 'addFieldDefinition',
        fieldDefinition,
      }),
    );
    return await this.updateCouponType(couponType, actions);
  }

  private async deleteCouponType(
    typeDefinition: TypeDraft,
  ): Promise<{ success: boolean }> {
    this.logger.debug({
      msg: 'Attempt to unconfigure custom field type for order that kept information about coupon codes.',
    });

    const couponType = await this.findCouponType(typeDefinition.key);

    if (!couponType) {
      this.logger.debug({
        msg: 'Custom field type not found, action not needed.',
      });
      return { success: true };
    }

    const ctClient = this.commerceToolsConnectorService.getClient();

    const response = await ctClient
      .types()
      .withId({ ID: couponType.id })
      .delete({
        queryArgs: {
          version: couponType.version,
        },
      })
      .execute()
      .catch((result) => result);
    if (![200, 201].includes(response.statusCode)) {
      const errorMsg = `Type: "${typeDefinition.key}" could not be deleted`;
      this.logger.error({
        msg: errorMsg,
        statusCode: response.statusCode,
        body: response.body,
      });
      return { success: false };
    }

    this.logger.debug({
      msg: `Type: "${typeDefinition.key}" deleted`,
      type: response.body,
    });

    return { success: true };
  }

  private async createCouponType(
    typeDefinition: TypeDraft,
  ): Promise<{ success: boolean }> {
    const ctClient = this.commerceToolsConnectorService.getClient();

    const response = await ctClient
      .types()
      .post({ body: typeDefinition })
      .execute()
      .catch((result) => result);
    if (![200, 201].includes(response.statusCode)) {
      const errorMsg = `Type: "${typeDefinition.key}" could not be created`;
      this.logger.error({
        msg: errorMsg,
        statusCode: response.statusCode,
        body: response.body,
      });
      return { success: false };
    }

    this.logger.debug({
      msg: `Type: "${typeDefinition.key}" created`,
      type: response.body,
    });

    return { success: true };
  }

  private async updateCouponType(
    oldCouponType: Type,
    actions: TypeUpdateAction[],
  ): Promise<{ success: boolean }> {
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
      .execute()
      .catch((result) => result);

    if ([200, 201].includes(response.statusCode)) {
      this.logger.debug({
        msg: 'Type: "couponCodes" updated',
        type: response.body,
      });
      return { success: true };
    }
    const errorMsg = 'Type: "couponCodes" could not be updated';

    this.logger.error({
      msg: errorMsg,
      statusCode: response.statusCode,
      body: response.body,
    });
    throw { success: false };
  }
}
