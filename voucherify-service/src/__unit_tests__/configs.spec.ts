import { AppValidationPipe } from '../configs/appValidationPipe';
import { ValidationSchema } from '../configs/validationSchema';

describe('ConfigsTest', () => {
  it('AppValidationPipe should be defined and return value', async () => {
    const result = AppValidationPipe;
    expect(AppValidationPipe).toBeDefined();
    expect(result).toBeInstanceOf(Object);
  });

  it('ValidationSchema should be defined and return value', async () => {
    const result = ValidationSchema;
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Object);
  });
});
