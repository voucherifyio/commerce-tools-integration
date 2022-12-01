# Integration tests for cart.service

The `handleCartUpdate` method in `cart service` is one of the most important `functions` in our integration app as it handles cart updates from commercetools, which is what we focus tests from this folder. Because the cart service has four dependencies that connect to external services via HTTP (`typesService`, `taxCategoriesService`, `voucherifyConnectorService` and `commerceToolsConnectorService`), we mock those dependencies and inject them into the cart service using `cart-service.factory.ts`. Therefore, each test scenario follows the steps:
1. Creates mocks for dependencies and defines desired responses
2. Creates `cart.service` injecting defined mocks
3. Executing `handleCartUpdate` method providing `cart` object that represents payload from commercetools API Extension
4. Assertions that can verify both: returned `cart actions` from the `handleCartUpdate` method and how the `cart service` dependencies were used.

