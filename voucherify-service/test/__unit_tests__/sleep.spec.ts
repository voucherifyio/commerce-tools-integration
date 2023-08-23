import sleep from '../../src/misc/sleep';

describe('SleepTest', () => {
  it('should be defined', async () => {
    const result = await sleep(1);
    expect(sleep).toBeDefined();
    expect(result).toBeNull();
  });
});
