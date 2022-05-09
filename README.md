# Voucherify <-> Commerce Tools integration

## Table of contents
1. [Installation and configuration guide](#installation-and-configuration-guide)
2. [Dependencies](#dependencies)
3. [Implemented funtionallities](#implemented-funtionallities)
4. [How to test your app](#how-to-test-your-app)

## Installation and configuration guide
1. Install dependencies with npm i command

2. Set environment variables for Voucherify and Commerce Tools. In Voucherify, you can find them in Project Dashboard > Project Settings > General Tab > Application Keys section. In Commerce Tools they are available only once, after new API Client creation, you can create new one in Settings > Project Settings > Create new API client (top right corner). You can set these variables in .env file or in a terminal, assign them to the names below:
    - VOUCHERIFY_APP_ID
    - VOUCHERIFY_SECRET_KEY
    - COMMERCE_TOOLS_PROJECT_KEY
    - COMMERCE_TOOLS_AUTH_URL
    - COMMERCE_TOOLS_API_URL
    - COMMERCE_TOOLS_ID
    - COMMERCE_TOOLS_SECRET
    - COMMERCE_TOOLS_SCOPES

3. (optional) Set LOGGER_PRETTY_PRINT environment variable to true, to have console output in a text format (by default it is in JSON format).
---
## Dependencies
- Node.js >= 16.15.0
- npm >= 8.5.5
---
## Implemented funtionallities
- npm run start - will start your application in developer mode
- npm run start:dev - will start an app, and will watch for changes
- npm run start:prod - will run in production mode
- npm run test - will run tests
---
## How to test your app
---