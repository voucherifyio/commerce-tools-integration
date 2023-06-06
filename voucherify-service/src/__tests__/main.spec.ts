import { AppModule } from '../app.module';

describe('MainSrcTest', () => {
  it('AppModule should be defined and be Object', async () => {
    const appModule = AppModule;
    expect(appModule).toBeDefined();
    expect(appModule).toBeInstanceOf(Object);
  });
});
