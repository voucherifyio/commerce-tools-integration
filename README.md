# Voucherify <-> Commerce Tools integration

## Table of contents
1. [Installation and configuration guide](#1-installation-and-configuration-guide)
2. [Dependencies](#2-dependencies)
3. [Implemented funtionallities](#3-implemented-funtionallities)
4. [How to test your app](#4-how-to-test-your-app)

## 1. Installation and configuration guide
    Install dependencies 
    > npm i

2. Set environment variables for Voucherify and Commerce Tools. In Voucherify, you can find them in Project Dashboard > Project Settings > General Tab > Application Keys section. In Commerce Tools they are available only once, after new API Client creation, you can create new one in Settings > Project Settings > Create new API client (top right corner). You can set these variables in .env file or in a terminal, assign them to the names below:
    - VOUCHERIFY_APP_ID
    - VOUCHERIFY_SECRET_KEY
    - COMMERCE_TOOLS_PROJECT_KEY
    - COMMERCE_TOOLS_AUTH_URL
    - COMMERCE_TOOLS_API_URL
    - COMMERCE_TOOLS_ID
    - COMMERCE_TOOLS_SECRET

3. (optional) Set LOGGER_PRETTY_PRINT environment variable to `true`, to have console output in a text format (by default it is in JSON format).
4. (optional) Set COMMERCE_TOOLS_WITH_LOGGER_MIDDLEWARE environment variable to `false`, to disable debugger mode in commerce tools connector.
5. (optional) Set API_EXTENSION_BASIC_AUTH_PASSWORD to any `String`, it will protect your exposed API Extension URL from unwanted traffic.
---
## Dependencies
- Node.js >= 16.15.0
- npm >= 8.5.5
---
## Implemented funtionallities

>npm run start - will start application in developer mode

>npm run start:dev - will start application in developer mode on localhost:3000, and will configure api extension if Ngrok is installed and configured on Your computer. 
> 
>To install and configure Ngrok, follow Step 2:  https://ngrok.com/docs/getting-started

>npm run start:prod - will start application in production mode

>npm run test - will run tests

>npm run config - currently working only while application is 'running'. It will configure:
>1. custom coupon type - needed to hold coupons codes inside cart object
>2. coupon tax category, needed for any coupon or gift card with fixed amount discount (for example -10 USD)
>
>Or you can send an empty POST request to application `[domain]/types/configure` and `[domain]/tax-categories/configure` while your application is 'running'.
## How to test your app
---