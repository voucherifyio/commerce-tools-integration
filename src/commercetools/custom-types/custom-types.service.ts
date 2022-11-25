import { Injectable, Logger } from '@nestjs/common';
import { CommercetoolsConnectorService } from '../commercetools-connector.service';
import { Type, TypeDraft, TypeUpdateAction } from '@commercetools/platform-sdk';
import {OREDER_COUPON_CUSTOM_FIELDS, LINE_ITEM_COUPON_CUSTOM_FIELDS} from './coupon-type-definition'

@Injectable()
export class CustomTypesService {
  constructor(
    private readonly commerceToolsConnectorService: CommercetoolsConnectorService,
    private readonly logger: Logger,
  ) {}

  public async findCouponType(typeName: string): Promise<Type | null> {
    const ctClient = this.commerceToolsConnectorService.getClient();
    const response = await ctClient
      .types()
      .get({ queryArgs: { where: `key="${typeName}"` } })
      .execute();
    if (
      ![200, 201].includes(response.statusCode) ||
      response.body?.count === 0
    ) {
      this.logger.debug({ msg: `${typeName} type not found` });
      return null;
    }
    const couponType = response.body.results[0];
    this.logger.debug({ msg: `${typeName} type found`, id: couponType.id });
    return couponType;
  }

  public async configureCouponTypes(): Promise<{ success: boolean }> {
    const orderConfig = await this.upsertCouponType(
      OREDER_COUPON_CUSTOM_FIELDS,
    );

    const productConfig = await this.upsertCouponType(
      LINE_ITEM_COUPON_CUSTOM_FIELDS
    );

    const isSuccess = !!orderConfig && !!productConfig;

    this.logger.debug({
      msg: isSuccess?'All custom-types are configured properly': 'Types are not configured properly',
    });

    return {success: isSuccess}
  }

  private async upsertCouponType(
    typeDefinition:TypeDraft
  ): Promise<Type | null> {
    this.logger.debug({
      msg: 'Attempt to configure custom field type for order that keeps information about coupon codes.',
    });
    
    const couponType = await this.findCouponType(typeDefinition.key);
    
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

    if (missingFields.length) {
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
      await this.updateCouponType(couponType, actions)
    }
    this.logger.debug({
      msg: 'Custom field type and fields are up to date.',
    });

    return couponType;
  }

  private async createCouponType(typeDefinition: TypeDraft):Promise<Type> {
    const ctClient = this.commerceToolsConnectorService.getClient();

    const response = await ctClient.types().post({body: typeDefinition}).execute();
    if (![200, 201].includes(response.statusCode)) {
      const errorMsg = `Type: "${typeDefinition.key}" could not be created`;
      this.logger.error({
        msg: errorMsg,
        statusCode: response.statusCode,
        body: response.body,
      });
      throw new Error(errorMsg);
    }

    this.logger.debug({
      msg: `Type: "${typeDefinition.key}" created`,
      type: response.body,
    });
    
    return response.body;
  }

  private async updateCouponType(oldCouponType: Type, actions: TypeUpdateAction[]) {
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
