import { replaceCodesWithInapplicableCoupons } from '../../src/integration/utils/replaceCodesWithInapplicableCoupons';

describe('replaceCodesWithInapplicableCoupons', () => {
  it('should map code to result', async () => {
    expect(
      replaceCodesWithInapplicableCoupons(['test'], 'errorMessage'),
    ).toEqual([
      {
        status: 'INAPPLICABLE',
        id: 'test',
        object: 'voucher',
        result: {
          error: {
            code: 404,
            key: 'not_found',
            message: 'errorMessage',
            details: `Cannot find voucher with id test`,
            request_id: undefined,
          },
        },
      },
    ]);
  });
});
