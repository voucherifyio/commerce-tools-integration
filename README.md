# commerce-tools-integration

[![Licence](https://img.shields.io/github/license/voucherifyio/commerce-tools-integration)]()
[![version](https://img.shields.io/github/package-json/v/voucherifyio/commerce-tools-integration)]()
[![code size](https://img.shields.io/github/languages/code-size/voucherifyio/commerce-tools-integration)]()

Voucherify's [commercetools](https://commercetools.com/) connector extends its discount capabilities with unique promo codes and advanced incentives, as well as with referral, gift card, and loyalty programs supported by [Voucherify promotion engine](https://www.voucherify.io).

Demo store https://sunrise-ct-voucherify.herokuapp.com


<div style="background-color: rgb(0, 18, 70); padding: 50px; border-radius: 50px">
   <img src="./public/voucherify-logo.svg" />
</div>

---

* [How does the integration between Voucherify and commercetools work?](#how-does-the-integration-between-voucherify-and-commercetools-work)
* [Commercetools API limits](#commercetools-api-limits)
* [How to work with commercetools API Extensions?](#how-to-work-with-commercetools-api-extensions)
* [Prerequisites](#prerequisites)
* [Cart updates](#cart-updates)
* [How set up the development environment?](#how-set-up-the-development-environment)
* [Installation and configuration guide](#installation-and-configuration-guide)
  + [Dependencies](#dependencies)
  + [Configuration](#configuration)
  + [Installation](#installation)
    - [For production](#for-production)
    - [For local development (ngrok required)](#for-local-development-ngrok-required)
    - [For development with public URL](#for-development-with-public-url)
* [Tests](#tests)
* [CLI](#cli)
* [REST API Endpoints](#rest-api-endpoints)
* [Heroku deployment](#heroku-deployment)
  + [Requirements](#requirements)
  + [Configuration](#configuration)
  + [Deployment](#deployment)
    - [Fork](#fork)
    - [New repository](#new-repository)
  + [Configure commercetools](#configure-commercetools)
  + [Register API Extension](#register-api-extension)
* [Sync](#sync)
  * [Metadata](#metadata)
* [Coupon text](#coupon-text)
* [Free shipping](#free-shipping)
* [Typical use case](#typical-use-case)
* [Contributing](#contributing)
* [Changelog](#changelog)
* [Migrations](#migrations)
* [Contact](#contact)
* [Final words](#final-words)
* [Licence](#licence)

## How does the integration between Voucherify and commercetools work?

The integration between Voucherify and commercetools allows your customers to use Voucherify-generated promotions in a store built on top of commercetools. We support all Voucherify campaigns.

We support coupons campaigns, including:

- [Validation sessions](https://docs.voucherify.io/docs/locking-validation-session) – temporarily lock the voucher's usage until redemption is successful, which is helpful for coupons with limited use.
- [Stackable discounts](https://docs.voucherify.io/docs/manage-stackable-discounts) – allow customers to use up to 5 coupons at the same time.
- [Validation rules](https://docs.voucherify.io/docs/validation-rules) – coupons valid only for select scenarios based on customer, cart or order attributes.
- [Loyalty program](https://support.voucherify.io/article/177-how-to-create-loyalty-program-step-by-step) - we support earning points from paid orders and using pay with points rewards
- [Unit discount](https://docs.voucherify.io/docs/give-item-for-free-unit-discount) – add free items to orders. Price of applied unit is fetched from commercetools product price including [price selectors](https://docs.commercetools.com/api/projects/products#price-selection).
- [Fixed amount](https://support.voucherify.io/article/512-complete-user-guide-on-discounts#fixed-order-amount) - coupons that set fixed prices of Your cart products or whole cart.
- [Free shipping](https://docs.voucherify.io/docs/free-shipping-discount) - adding free shipping to your cart when proper code is applied. Check [Free shipping section](#free-shipping) for more information.
- [Prepaid gift cards](https://docs.voucherify.io/docs/prepaid-gift-cards) - coupons that add to products or whole cart a certain discount value from gift cars.
- [Referal campaigns](https://support.voucherify.io/article/48-referral-program-basics) - [https://youtu.be/f6hFUtV0n1k?t=479](https://youtu.be/f6hFUtV0n1k?t=479)


If we want to allow customers to use coupons defined in Voucherify, the integration application needs to:

1. Watch cart updates on the commercetools’ side. If a customer adds a coupon code, use Voucherify API to validate coupons, get discount details and apply discounts back to the commercetools cart.
2. Record fulfilled orders from commercetools on the Voucherify’s side using Voucherify redeem endpoint.

![commercetools & Voucherify integration flow chart](./public/integration-flow.jpeg)

In addition, we suggest synchronizing your customer, product, and order data between commercetools and Voucherify, so you can use that data to build more advanced promotion campaigns. 

## Commercetools API limits
To assure good performance for every project using commercetools Composable Commerce, the API imposes limits on certain parameters and objects.

TaxCategories:
* A maximum number of 100 TaxCategories can be created per Project. [Learn more about this limit.](https://docs.commercetools.com/api/limits#tax-categories)

Product Types:
* A maximum of 1 000 [Product Types](https://docs.commercetools.com/api/projects/productTypes#producttype) can be created.

Extensions:
* A maximum of 25 [Extensions](https://docs.commercetools.com/api/projects/api-extensions) can be created per project.

## How to work with commercetools API Extensions?

Our integration uses [commercetools API Extensions](https://docs.commercetools.com/api/projects/api-extensions) to monitor cart and order updates. But, before commercetools can send us HTTP requests with cart and order update details, we need to register API Extension and let commercetools know under which public URL our integration is available. There are two scenarios. First, if you run the integration on a publicly available server, you can register or unregister commercetools API Extension using `npm run api-extension-add`, `npm run api-extension-delete` or `npm run api-extension-update` commands. Those commands use the APP_URL environment variable as the public server address where commercetools will send cart and order updates. The second scenario is when you develop or test integration locally, and your PC does not have public IP or domain. In that case, you need to use a reverse proxy (e.g., ngrok) solution to expose your local integration application. To simplify this process, we built a script npm run dev:attach that runs an ngrok reverse proxy service, uses a randomly generated ngrok public URL to register API Extension in commercetools and start our application.

``` mermaid
graph LR;
    U((User))
    SF(Store front)
    CT(commercetools)
    V(Voucherify)
    I(Integration App)

    U-- Browse -->SF
    SF-- GraphQl -->CT
    CT-. API Extension .->I
    I-. REST API .->CT
    I-.  REST API .->V
```

Please note:

1. commercetools API Extensions pointing to the server that does not respond or does not exist will block your commercetools API. Therefore, you must ensure that you have registered in commercetools only required API Extensions pointing to working servers. You can list currently registered API Extensions using `npm run api-extension-list` command.
2. `npm run api-extension-delete` and `npm run api-extension-update` commands recognize their own API Extension records by the `key` value configured in COMMERCE_TOOLS_API_EXTENSION_KEY environment variable (default value is `VOUCHERIFY_INTEGRATION`

## Cart updates

Handling API Extensions request from commercetools with information about cart update is the heart of the integration. Upon receiving cart update requests, the integration app will:

- Set custom cart fields definition for newly created carts where we will keep information about applied discounts. 
- Validate discounts using Voucherify API, sending collected information about cart items and discount codes.
- Update cart custom fields with the data which coupons were applied or not.
- Apply the percentage or amount discount to the cart by adding a custom line item.
- Add required promotional products to the cart (if unit type discount is used).

Please note that by putting information about applied discount codes in the cart custom fields, we bypass the commercetools Discount Codes feature. This approach lets us prevent confusing Voucherify with commercetools discounts but also requires little changes on the store frontend that uses commercetools API. Primarily, you had to change how you add and read discount codes from commercetools API and use the discount_codes cart custom field instead of the commercetools addDiscountCode action. For development purposes, we prepared [Sunrise Storefront for Commercetools adjusted to work with discount coupons managed by Voucherify](https://github.com/voucherifyio/sunrise-for-commerce-tools-integration). The [README.md](https://github.com/voucherifyio/sunrise-for-commerce-tools-integration/blob/main/README.md) file describes all required changes in detail.

## How set up the development environment?

1. Create new Voucherify and commercetools trial accounts.
2. Load test data to commercetools using [Sunrise Data](https://github.com/commercetools/commercetools-sunrise-data) project and follow instructions in the README.md file.
3. Install the integration app locally following the [Installation and configuration guide](#installation-and-configuration-guide).
4. Install [Sunrise Storefront](https://github.com/voucherifyio/sunrise-for-commerce-tools-integration) adjusted to work with Voucherify discounts, following the instruction from the "Installation" section of the README.md file. 

## Prerequisites

- Voucherify [account](http://app.voucherify.io/#/signup) and [API keys](https://docs.voucherify.io/docs/authentication)
- commercetools [account](https://commercetools.com/free-trial) with API Client and API keys

## Infrastructure

Handling cart updates (validating coupons, getting promotions, releasing sessions):
``` mermaid
graph LR;
    I((integration service))
    CT(commercetools service)
    CustomTypes(custom-types service)
    TaxCategories(tax-categories service)
    V(voucherify service)
    VC(voucherify-connector service)
    SA(store data/actions)
    APIE(api extension)

    APIE--commercetools cart-->CT
    CT--actions-->APIE
    CT--create class-->SA
    CT--integration cart, store data/actions, ?helper to get products-->I
    I--validationg coupons and promotions, releasing sessions-->V
    V-->VC
    I--geting ids/SKU/prices of products to add for unit type coupons-->CT
    CT--getting custom type schema for coupons-->CustomTypes
    CT--getting coupons taxcattegory if application applies a cart discounts by adding a custom line items-->TaxCategories
```
Please note that we are getting cart through API Extension, so we have max ~2000ms to send response, otherwise any cart change will be cancelled.
That is why we need to be able to handle such events by asking commercetools if cart was successfully updated (see 
`MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT` for more information).

This app is created this way to give us option to swap in the future commercetools service (commercetools store) with any other store service if needed.
Integration service in order to return data to commercetools service while handling cart updates requires 2 variables
(cart (integration type) and storeData class)). Integration will set available promotions, applicable coupons,inapplicable coupons and more in StoreData class.
When finished StoreData class should have all data needed to create response.

Handling order updates (redeeming order if order status is **Paid**):
``` mermaid
graph LR;
    I((integration service))
    CT(commercetools service)
    V(voucherify service)
    VC(voucherify-connector service)
    APIE(api extension)

    APIE--commercetools order-->CT
    CT--integration order-->I
    I--redeeming order-->V
    V-->VC
```

Please note that we are using api extension, but we are not returning any actions to modify order.

Integration service just need to get order (integration type) and redeeming should happen.

## Installation and configuration guide

### Dependencies
- Node.js >= 16.15.0
- npm >= 8.5.5

### Configuration

Set environment variables with credentials to Voucherify and commercetools APIs. For local development, put the configuration into `.env` file (see `.env.example` configuration template).
- `APP_URL` - a public URL where the application is hosted. commercetools will use this URL to make [API Extension HTTP requests](https://docs.commercetools.com/api/projects/api-extensions). This configuration is ignored for local development servers as ngrok provides a public URL dynamically. 
- In Voucherify, go to `Project Dashboard > Project Settings > General Tab > Application Keys`.
    - `VOUCHERIFY_APP_ID`
    - `VOUCHERIFY_SECRET_KEY`
    - `VOUCHERIFY_API_URL`
- In commercetools, credentials are available when a new API Client is created. You can create it in `Settings > Developer Settings > Create new API client (top right corner)` using the `Admin client` scope template.
    - `COMMERCE_TOOLS_PROJECT_KEY`
    - `COMMERCE_TOOLS_AUTH_URL`
    - `COMMERCE_TOOLS_API_URL`
    - `COMMERCE_TOOLS_ID`
    - `COMMERCE_TOOLS_SECRET`
- Additional configuration variables
    - (optional) `COMMERCE_TOOLS_COUPON_NAMES` - stringifies object with possible values used as a coupon label in order summary, for example `COMMERCE_TOOLS_COUPON_NAMES='{"en":"Coupon codes discount","de":"Gutscheincodes rabatt"}'`
    - (optional) `COMMERCE_TOOLS_API_EXTENSION_KEY` - value used in API Extension `key` attribute used to recognize its own API Extension records, default value is: `VOUCHERIFY_INTEGRATION`
    - (optional) `LOGGER_PRETTY_PRINT` - `true` to get console output in the text format (JSON by default).
    - (optional) `COMMERCE_TOOLS_WITH_LOGGER_MIDDLEWARE` - `false` to disable debugger mode in commercetools connector.
    - (optional) `API_EXTENSION_BASIC_AUTH_PASSWORD` - (`String`) protects your API Extension URL from unwanted traffic.
    - (optional) `CUSTOM_NGROK_BIN_PATH` - a custom path to your ngrok binary file e.g /opt/homebrew/bin for Macbook M1 cpu
    - (optional) `PORT` - application port (default is 3000)
    - (optional) `LOGGER_LEVEL` - logging level for `npm run test`. You can set it to `error` or `fatal`.
    - (optional) `DEBUG_STORE_REQUESTS_IN_JSON` - `true` if you want to keep external requests / response in a JSON file.
    - (optional) `DEBUG_STORE_REQUESTS_DIR` - name of the directory where JSON files with request / responses are stored. 
    - (optional) `COMMERCE_TOOLS_COUPONS_LIMIT` - maximum number of coupons that could be applied to cart. Default and maximum value is 5 related to [Voucherify Api](https://docs.voucherify.io/reference/redeem-stacked-discounts)
    - (optional) `DISABLE_CART_PROMOTION` - allow to disable [cart level promotion](https://support.voucherify.io/article/519-create-cart-level-promotions) functionality. It will reduce number of api calls because it's remove usage of [promotion validation request](https://docs.voucherify.io/reference/validate-promotions-1) from all cart related operation.
    - (optional) `APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT` - by default, the application applies a cart discount by adding a custom line item. Set this option value as `true` to enforces the application to use the commercetools beta feature called [direct discounts](https://docs.commercetools.com/api/projects/carts#set-directdiscounts) to apply discounts on the cart.
    - (optional) `MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT` - default `1000`[ms]. Accepts range of numbers `0` - `1750`. If set to `0` we will always be checking if application responded to
  API Extension within acceptable time window. If set higher, for example `1000`(default) that means that we will be checking if we responded to API Extension only if building actions (validating coupons) took more than **1000ms**.
  NOTE: This checking only happens when cart has at least 1 coupon active(added to cart).

### Installation

Set up the configuration for the first run.
```
npm run config
```

#### For production
```bash
npm install
npm run start
npm run register
```

#### For local development (ngrok required)
```bash
npm install
npm run dev:attach 
```

#### For development with public URL
```bash
npm install
npm run dev
npm run register
```
---

## Tests

`npm run test`

We have created integration tests to cover the most important scenarios connected with handling validation process and operations on cart. We mocked requests from commercetools and Voucherify to check behaviour of our application. You can examine tests [here](src/integration/__tests__) and mocks here: [1](src/commercetools/__mocks__/commerce-tools-connector.service.ts), [2](src/commercetools/tax-categories/__mocks__/tax-categories.service.ts), [3](src/commercetools/custom-types/__mocks__/types.service.ts), [4](src/voucherify/__mocks__/voucherify-connector.service.ts). Currently, we cover the following scenarios:
- creating a new cart (cart.version = 1)
- running API extension without any applied coupons (testing integration between V% and CT)
- running API extension when removing currently applied coupons
- adding an amount type coupon
- adding a percentage type coupon
- adding the same single use coupon in a different session
- adding coupons which don't exist
- adding a second amount type coupons right after a percentage type coupon
- changing the quantity of products with an applied amount and percentage type coupons

## CLI

- `npm run start` - start the application in production mode
- `npm run dev` - start the application in development mode
- `npm run api-extension-add` - add commercetools API Extension pointing to your server (server url is taken from APP_URL environment variable)
- `npm run api-extension-delete` - remove commercetools API Extension by Key value configured in COMMERCE_TOOLS_API_EXTENSION_KEY environment variable. Optionaly you can provide specific API Extension Id by `npm run api-extension-delete -- --id=xxx-xxx-xxx`
- `npm run api-extension-update` - remove old and add new API Extension pointing to your server, url is taken from APP_URL environment variable, old API Extension is recognized by API Extension key configured by COMMERCE_TOOLS_API_EXTENSION_KEY environment variable
- `npm run api-extension-list` - list all commercetools API Extensions
- `npm run dev:attach` - start the application in development mode including:
    - launching ngrok and collecting dynamically generated URL
    - updating commercetools API Extension to point to our development server
- `npm run config` - set up the required basic configuration in commercetools:
    1. custom coupon type - needed to store coupons codes inside the [Cart](https://docs.commercetools.com/api/projects/carts) object
    2. coupon tax category - needed for any coupon or gift card with a fixed amount discount
- `npm run test` - run Jest tests
- `npm run migrate` - migrate data from commercetools to Voucherify. Arguments:
    - `type` - required - type of data which you want to migrate. Values: `products`, `orders`, `customers`
    - `days` - optional - set number of days to sync from the past. Value: `number`
    - `hours` - optional - set number of hours to sync from the past. Value: `number`
    - `ms` - optional - set number of milliseconds to sync from the past. Value: `number`
    - `date` - optional - set date from which the resources are to be migrated. Format: `YYYY-MM-DD`
    - `longdate` - optional - set date and time from which the resources are to be migrated. Format: `YYYY-MM-DDTHH:MM:SS` \
    Examples: 
    - `npm run migrate -- --type=products`
    - `npm run migrate -- --type=orders --days=5`
    - `npm run migrate -- --type=customers --longdate=2022-03-21T21:04:37`

## REST API Endpoints

- `GET /` - welcome application message
- `POST /api-extension` - handle API extension requests (cart) from commercetools
- `POST /types/configure` - trigger coupon types configuration
- `POST /tax-categories/configure` - trigger coupon tax configuration (equal to `npm run config`)

---

## Heroku deployment

### Requirements
- Heroku account [login](https://id.heroku.com/login) or [register](https://signup.heroku.com/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Git](https://devcenter.heroku.com/articles/heroku-cli) installed

### Configuration

1. Create a new application on your Heroku account with a given <application_name>
2. Go to your <application_name> -> Settings -> Reveal Config Vars
3. Configure your commercetools application and set up environment variables [see Configuration](#configuration)

### Deployment


#### Fork
1. Fork this repository
2. Clone your fork
```bash
git clone <fork_name>
```
3. Login to your Heroku account
```bash
heroku login
```
4. Create a remote branch for Heroku deploy 
```bash
heroku git:remote -a <application_name>
```
5. You don't need to create any procfile. By default, Heroku recognizes package.json and run `npm install` and `npm start`.
6. Deploy the code
```bash
git push heroku master # For master branch
git push heroku main # For main branch
git push heroku <branch_name>:main # For other branch
```

#### New repository

1. Go to the source code folder
2. Login to Heroku account
```bash
heroku login
```
3. Init git repository
```bash
git init
git add .
git commit -m "Init"
```
4. Create a remote branch for Heroku deploy 
```bash
heroku git:remote -a <application_name>
```
5. Deploy the code
```bash
git push heroku master # For master branch
git push heroku main # For main branch
git push heroku <branch_name>:main # For other branch
```

### Configure commercetools

1. Go to your <application_name> -> More -> Run console
2. Run `npm run config` 

This command should be run once shortly after you deploy your application, and **each time when your commercetools project change the list of countries in which it operates**.

### Register API Extension

1. Go to your <application_name> -> More -> Run console
2. Run `npm run api-extension-add` 

This command should be run once (or each time after `npm run api-extension-delete`).

## Sync
Data migration allows us to handle more advanced features of Voucherify, so it is important to keep data updated (however it is still optional if you use only basic functionalities). Migration is done via `npm run migrate` commands. When you are launching the integration app the first time you should fetch all data (`products`, `orders`, `customers`). After that to keep Voucherify updated it will be convenient to sync data once in a while. To not process all the data each time you can pass additional arguments (e.g. `days`, `date`) to shorten the sync period and as a result decrease time of these operations. You can do it manually, but we highly recommend automating this process with some tool like `Cron`. The period between syncs should depend on traffic on your platform or the time when new vouchers, campaigns, etc. are created to make them as close to the newest data as possible.

### Metadata
Additionally, each time migration happen metadata will be tried to sync. Metadata is [a feature of Voucherify](https://docs.voucherify.io/docs/metadata-custom-fields) which allows
you to create more specific vouchers and campaigns. These properties are mapped from names of custom fields from commercetools for customer, from attributes for products and from attributes
and names of custom fields from order (please add `custom_field_`). You can set which metadata you want to have by setting it in `Voucherify -> <your profile> -> Project Settings -> Metadata Schema`. During redemption an `order` and a `product sku` included in
this specific order metadata will be tried to sync too.

#### Important
1. If you set some metadata in Voucherify to required, and this attribute would not be on your resource in commercetools, then whole operation will fail!
2. Make sure that Voucherify metadata it's defined properly. If set types are not compatible with data provided by CT update may fail.
3. Syncing `customers` uses CT `Custom Fields`.
4. Syncing `products` uses `Attributes`. In this case be sure you provide CT `Attribute identifier` instead on `Attribute label`. You can check this under `Settings -> Product types and attributes` tab.
5. Syncing `orders` uses CT `Custom Fields` when starts with `custom_filed_`, otherwise uses `Properties` of Commercetools [Orders](https://docs.commercetools.com/api/projects/orders) for example: `shippingAddress` or `country`. EXCEPTION: for payments add `payments` instead of `paymentInfo`.

## Coupon text
All discounts are added as one `CustomLineItem` with a negative price.
This item should be visible to the customer on the invoice to know how the price is affected.
To make this readable for each customer we provide the possibility to change the name of this item depending on the language which customer uses.
To make it work correctly, a developer should add `COMMERCE_TOOLS_COUPON_NAMES` environment variable, with stringified object, where keys are an [IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag) and its values are coupon names translated to that languages. Later on, the text will be automatically chosen by the commercetools mechanism to match the language proper for a customer.

Example: `'{"en":"Coupon codes discount","de":"Gutscheincodes rabatt"}'`

## Free shipping

Free shipping is one of our discount codes type. To handle this case You must define Free shipping code. You can define it on two ways:

1. You can create predefined coupon with `Free shipping` type.
   This coupon is connected to pre created product with `source id = 5h1pp1ng`.
   In this case You can clearly define coupon type by this ID because it's given by Voucherify and cannot be changed.
   **Make sure to change in V% dashboard product with source ID "5h1pp1ng" to 0$**

   ![Voucherify freeshipping configuration](public/voucherify-freeshipping-config.png)
2. To create new or use existing product which will represent Your shipping method.
   If you have chosen your product now You can create new discount with unit type of this product. **Make sure to set price of this product to 0$**

When you apply whichever of this discount code, the connected `product id` it will be set to commercetools cart custom field named shippingProductSourceIds.
Next step is to properly define shipping method in Your commercetools panel and configure [Predicates](https://docs.commercetools.com/tutorials/shipping-method-with-predicate). Go to `Settings -> Project settings -> Shipping methods`. Use existed or create new shipping method which will be applied if one of codes will be used.
In `Shipping method -> Predicate` field You can define condition when a given shipping method will be available. To allow uses to use Your new free shipping method you need to define formula.

`custom.shippingProductSourceIds contains any ("5h1pp1ng")` - this formula is used for default free shipping code with predefined `source id = 5h1pp1ng`
![CT shipping free method](public/ct-shipping-config.png)

`custom.shippingProductSourceIds` contains any `("<your_source_id>")` - this formula should be used when you want to apply this shipping method with custom vourcherify shipping method.

To learn more about predicates You can see [here](https://docs.commercetools.com/api/predicates/query).

To set new free shipping method by default after applying a code in our [Sunrise fork](https://github.com/voucherifyio/sunrise-for-commerce-tools-integration) set `key` field in the shipping configuration to `FREE_SHIPPING_DEFAULT`.

#### Important
1. Make sure that you `customField` definition is properly set. You can run `npm run config` to make this configuration.
2. If you choose free shipping code with custom product make sure that this product is properly defined in commercetools and can be applied to cart.
3. Make sure You configure zones and shipping rates in Your shipping method in commercetools.

## Loyalty program

Currently, we support a few cases related to loyalty program. Firstly we provide earning points by paying orders and using rewards with type `pay with points`. To handle other type rewards like getting coupon for points You can simply use our [Customer cockpit](https://support.voucherify.io/article/177-how-to-create-loyalty-program-step-by-step#cockpits)   

## Typical use case

1. As a customer who opens a store page in the browser (Sunrise Storefront), I add some products to the cart and on the cart page, I add one of the available coupon codes (you can check the available discounts in the Voucherify admin panel for trial accounts you should have preconfigured, e.g., BLACKFRIDAY code).
2. As a customer who added an existing coupon code, I should see the granted discount value and be able to finish the order.
3. As the store operator logged into the commercetools panel, I see new orders, including applied coupon codes on the Custom Fields tab and applied coupon discount value in the Order items list.
4. As the store operator logged into the commercetools panel when I update Order Payment Status to Paid, customer, order, and redeemed objects are created in Voucherify.

![Order screen in commercetools](./public/ct-order.png)
![Order custom fields in commercetools](./public/ct-order-custom-fields.png)
![Redemption screen in Voucherify](./public/voucherify-redemption.png)

---

## Contributing

If you found a bug or want to suggest a new feature, please file a GitHub issue.

## Changelog
- 2022-05-05 `v5.2.2`
  - do not make unnecessary, malformed requests to CT for a products
  - update tests
  - for used cart promotions, separate promotion id from promotion banner
  - fixed console logging data while using `migration CLI`
- 2022-05-04 `v5.2.1`
  - minor bugfix, when someone have defined unit type promotion/voucher in Voucherify dashboard not based on commercetools products, we should not be looking for this product in commercetools backend store.
- 2022-12-07 `v5.2.0`
  - domain refactoring/code quality
  - optimization
  - adding new config var: `MAX_CART_UPDATE_RESPONSE_TIME_WITHOUT_CHECKING_IF_API_EXTENSION_TIMED_OUT` (default value `1000`[ms]). For more info check configuration section.
- 2022-10-26 `v5.1.2`
  - cashing coupons tax category
- 2022-10-19 `v5.1.1`
   - refactoring/code quality
   - added unit tests for [DirectDiscount](https://docs.commercetools.com/api/projects/carts#directdiscount)
   - readme update, adding some descriptions
   - minor fix for corner case for unit type discount
- 2022-10-12 `v5.1.0`
    - added support of [DirectDiscount](https://docs.commercetools.com/api/projects/carts#directdiscount). If you want to use DirectDiscounts please make sure you added 
  `APPLY_CART_DISCOUNT_AS_CT_DIRECT_DISCOUNT=true` to your config file.
    - metadata for order now uses `Properties` of Commercetools [Orders](https://docs.commercetools.com/api/projects/orders) for example: `shippingAddress` or `country` or `Custom Fields` when
        starts with `custom_filed_`. Because of that, this version is not fully compatible with the previous one.
    - improvement of displaying promotion banner
    - adding option to disable by setting environment variable cart level promotion functionality (see section `Additional configuration` variables for more information).
    - new orders migrated from commercetools will be set with correct status `PAID` or `CREATED`
    - sometimes application was unstable, we fixed it by catching the errors better.
    - in case of cart level promotion, information about a customer will be provided (for example for validations purposes)
    - we fixed several minor bugs with unit type coupons
- 2022-09-15 `v5.0.1`
    - fixes to unit type discount
- 2022-09-14 `v5.0.0`
    - this version is not fully backward compatible due to changes in a way how [coupon text](#coupon-text) is configured
    - change configuration of [coupon text](#coupon-text) from config in a `.ts` file to config via `COMMERCE_TOOLS_COUPON_NAMES` environment variable
    - fix logging list of available api extensions while using `npm run api-extension-list` command
    - added safeguard when auto-applied coupon failed to keep remaining codes in cart
    - added showing errors when validation failed and there is no safeguards
    - handling configuration for maximum coupons limit
    - adding rollback for coupon validation, session and redemption when connection with CT will time out
- 2022-09-06 `v4.2.2`
    - fixed situation when redemptions fails and operations on order are blocked
    - remove additional request to voucherify with metadata
- 2022-09-05 `v4.2.1`
    - fixed saving total amount on paid orders
- 2022-08-26 `v4.2.0`
    - added support for fixed price promotions
    - bugfixes handling proper price from commercetools when product have only main variant
    - compatible with previews version but required to run `npm run config` command to proper set new `lineItemCustomField`
    - bugfixes empty values when applying prepaid gift cards
    - synchronizing orders, with no coupons applied, into voucherify
- 2022-08-25 `v4.1.1`
    - added promotion tier handling
- 2022-08-24 `v4.1.0`
    - added handling free shipping codes
    - new `customField` definition added
    - compatible with previews version but required to run `npm run config` command to proper set new `customField`
- 2022-08-19 `v4.0.0`
    - version not compatible due to changes in a way how `Custom Line Item` with discount is handled
    - added possibility to set coupon text in order summary depending on the language which customer use
    - added handling proper price from commercetools including the price selector when unit type discount is applied.
- 2022-08-10 `v3.0.5`
    - update readme about how handle metadata
- 2022-08-09 `v3.0.4`
    - updating metadata in order and order product skus during redemption action. 
- 2022-08-08 `v3.0.3`
    - update rate limiter in orders sync - now there are used methods, from new voucherify sdk, to get limit information, instead of using fetch library for that
- 2022-08-05 `v3.0.2`
    - many thanks again to [@Irene350](https://github.com/Irene350) for your contribution!
    - optimising the code to retrieve all the project countries for coupon tax category (`npm run config`)
    - refactoring
    - minor changes in readme (`npm run config`)
- 2022-08-05 `v3.0.1`
    - fix period argument of migrate command
- 2022-08-03 `v3.0.0`
    - many thanks to [@Irene350](https://github.com/Irene350) for your contribution!
    - this version is not fully backward compatible because of differences in migration commands
    - added sync of customers who made an order without account
    - enhanced CLI: removing three `migrate-...` commands and replace them with one `migrate` with several options
    - added migration of metadata: as metadata from commercetools side are considered `custom fields` in case of `orders` and `customers` and `attributes` in case of `products`
    - readme update
- 2022-08-02 `v2.0.0`
    - version v2.x is not fully backward compatible with version v1.x, please refer to [Migration from v1.x.x to v2.x.x](#migration-from-v1xx-to-v2xx) section
    - fixing the issue with removing the commercetools API Extension pointing to other integrations
    - removed CLI commands: `register` and `unregister`
    - added CLI commands: `api-extension-add`, `api-extension-update`, `api-extension-delete` and `api-extension-list`
    - added new optional configuration (`COMMERCE_TOOLS_API_EXTENSION_KEY` environment variable) to recognize own commercetools API Extension from 3rd party ones when performing delete or update operations
    - remove coupon from session when coupon is deleted from a cart, it requires [Sunrise Storefront v2.0.0](https://github.com/voucherifyio/sunrise-for-commerce-tools-integration)
- 2022-07-28 `v1.0.1` Update README.md file
- 2022-07-26 `v1.0.0` Initial release

## Migrations

### Migration from v4.x.x to v5.x.x
- stringify object from `src/misc/coupon-text.ts` file and insert it as a value for `COMMERCE_TOOLS_COUPON_NAMES` environment variable
- run `npm i`
- run `npm run config` command to proper set custom field `isValidationFailed` and `couponsLimit`
### Migration from v3.x.x to v4.x.x
- if you are using sunrise, update it to version `v.3.0.0` or higher
- if there exists carts with added coupons, now it will be impossible to remove them properly from cart - write simple script, which will [list](https://docs.commercetools.com/api/projects/carts#query-carts) all existing carts and then [delete](https://docs.commercetools.com/api/projects/carts#delete-a-cart) them

### Migration from v2.x.x to v3.x.x
- run `npm i`, because of using new version of Voucherify SDK, which can handle metadata schemas
- replace all migrations commands `npm run migrate-products`, `npm run migrate-orders`, `npm run migrate-customers` with `npm run migrate -- --type=products`, `npm run migrate -- --type=orders`, `npm run migrate -- --type=customers`

### Migration from v1.x.x to v2.x.x

- replace old commercetools API Extensions pointing to your integration application:
    - list all existing commercetools API Extension by `npm run api-extension-list` command 
    - if there are existing commercetools API Extensions pointing to your integration app with empty value in `Key` columns, remove this API Extension by `id` value using `npm run api-extension-delete -- --id=xxx-xxx-xx` command
    - ensure that you have configured `APP_URL` environment variable
    - add new API Extension using `npm run api-extension-add` command
- use `npm run api-extension-update` instead of `npm run register` command
- use `npm run api-extension-delete` instead of `npm run unregister` command


## Contact

If you have questions, comments, or need help with the code, we're here to help:
* on [Slack](https://www.voucherify.io/community)
* by [email](https://www.voucherify.io/contact-support)

For more tutorials and full API reference, visit Voucherify [Developer Hub](https://docs.voucherify.io).

## Final words

We believe that the commercetools setup can vary between implementations and integration requirements may differ in each case. Because of that, we distributed integration between Voucherify and commercetools as an open source application so that everyone can download, host, and adjust the solution to their unique business requirements.

## Licence
[MIT](./LICENSE.md) Copyright (c) 2022 voucherify.io


