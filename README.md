## Table of contents

1. [Introduction](#1-installation-and-configuration-guide)
2. [Installation and configuration guide](#2-installation-and-configuration-guide)
3. [CLI](#3-cli)
4. [How to test your app](#4-how-to-test-your-app)
 
# 1. Introduction

This open-source application allows you to integrate Commerce Tools (headless e-commerce) with Voucherify (promotional engine) using their public APIs. This integration enables buyers to use coupons generated and configured in Voucherify in store.


``` mermaid
graph LR;
    U((User))
    SF(Store front)
    CT(Commerce Tools)
    V(Voucherify)
    I(Integration App)

    U-- Browse -->SF
    SF-- REST API -->CT
    CT-. API Extension .->I
    I-. REST API .->CT
    I-.  REST API .->V
```

## 2. Installation and configuration guide

### Dependencies
- Node.js >= 16.15.0
- npm >= 8.5.5

### Manual product migration from CommerceTools to Voucherify
- Go to https://impex.commercetools.com/
- Login with your merchant account credentials
- Click `Commands` on a dropdown list button from the top bar and select `Product exporter`
- Prepare two .csv files
    - open Google Sheets, Microsoft Excel or similiar program
    - create new file
    - in first row in first document insert following texts (each in new column): `id`, `name.en`
    - in first row in second document insert following texts (each in new column): `id`, `name.en`, `sku`, `prices`
    - save file
- Upload first file to Impex
- Select `Export only masterVariants`
- Click run command and wait for a moment
- After action was completed, click `Download file`
- Upload second file to Impex
- Select `Fill all variant rows with product information` checkbox
- Click run command and wait for a moment
- After action was completed, click `Download file`
- Parse second file - whatever is in `prices` column, you have to change it to be one number (integer or float) with proper price
- Go to https://www.voucherify.io/ and login
- Select `Products` from the left panel
- Click `Import` (top right corner)
- Choose `Import Products` and `Import`
- Upload first file previously downloaded from Impex and click `Map fields`
    - `id` => `Source id`
    - `name.en` => `Name`
- Click `Import` and wait (it can take a moment)
- Again select `Products` from the left panel
- Click `Import` (top right corner)
- Choose `Import Skus` and `Import`
- Upload second file, click `Map fields`
    - `id` => `Product id`
    - `name.en` => `SKU`
    - `sku` => `Source id`
    - `prices` => `Price`
- Click `Import` and wait
- Import should be successfull
### Installation steps:

- Install dependencies via CLI: `npm i`
- Set environment variables with credentials to Voucherify and Commerce Tools APIs. For local development purposes, put configuration into `.env` file (please, look at `.env.example` configuration file template).
    - `APP_URL` - the public URL where this application is available. Commerce Tools will use this URL to make API Exteniosn HTTP requests to our integration application. This configuration is ignored for local development servers as ngrok provides this public dynamically. 
    - In Voucherify, you can find them in the `Project Dashboard > Project Settings > General Tab > Application Keys` section.
        - `VOUCHERIFY_APP_ID`
        - `VOUCHERIFY_SECRET_KEY`
    - In Commerce Tools, credentials are available only once; after new API Client creation. You can create a new API Client in `Settings > Developer Settings > Create new API client (top right corner)` using the `Admin client` scope template.
        - `COMMERCE_TOOLS_PROJECT_KEY`
        - `COMMERCE_TOOLS_AUTH_URL`
        - `COMMERCE_TOOLS_API_URL`
        - `COMMERCE_TOOLS_ID`
        - `COMMERCE_TOOLS_SECRET`
    - Additional configuration variables
        - (optional) `LOGGER_PRETTY_PRINT` - set environment variable to `true`, to have console output in a text format (by default it is in JSON format).
        - (optional) `COMMERCE_TOOLS_WITH_LOGGER_MIDDLEWARE` - set environment variable to `false`, to disable debugger mode in commerce tools connector.
        - (optional) `API_EXTENSION_BASIC_AUTH_PASSWORD` - set to any `String`, it will protect your exposed API Extension URL from unwanted traffic.
        - (optional) `CUSTOM_NGROK_BIN_PATH` - set if want to use custom path to Your ngrok binary file e.g /opt/homebrew/bin for Macbook M1 cpu
        - (optional) `PORT` - set application port (default is 3000)
For local development, you need to publicly expose your local environment so that Commerce Tools can make an API Extension HTTP request to your server. We suggest installing `ngrok` for that purpose by following the installation process described here: https://ngrok.com/docs/getting-started

---

## 3. CLI

- `npm run start` - start the application in production mode
- `npm run dev` - start the application in development mode
- `npm run dev:attach` - start application in development mode including:
    - launching ngrok and collecting dynamically generated URL
    - configure Commerce Tools API Extension to point to our development server
- `npm run config` - it will handle the required basic configuration in Commerce Tools:
    1. custom coupon type - needed to hold coupons codes inside cart object
    2. coupon tax category - needed for any coupon or gift card with a fixed amount discount
- `npm run test` - will run JestJs tests

## 4. How to test your app

@todo

## 5. REST API Endpoints

- `GET /` - welcome application messgae
- `POST /api-extension` - handle api extension requests (cart) from Commerce Tools
- `POST /types/configure` - trigger to configure coupon types in Commerce Tools
- `POST /tax-categories/configure` - trigger to configure coupon tax categories in Commerce Tools

## 6. Heroku deployment

### Requirements

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [Git](https://devcenter.heroku.com/articles/heroku-cli) installed

### Configuration

1. Create new application on your Heroku account with given <application_name>
2. Go you your <application_name> -> Settings -> Reveal Config Vars
3. Post there all needed environment variables which was [mentioned here](#installation-steps)
    - for your APP_URL it must be URL provided by Heroku four you application. It should be something like https://<application_name>.herokuapp.com 

### Deployment

To install and deploy CT Integration you cant fork this repository or download source code and init new Git repository. Both ways are described below.

#### Fork deploy
1. Fork this repository
2. Clone your fork
```bash
git clone <fork_name>
```
3. Login to Heroku account
```bash
heroku login
```
4. Create remote branch for Heroku deploy 
```bash
heroku git:remote -a <application_name>
```
5. You dont need to add any Procfile. By default Heroku recognize package.json and run `npm install` and `npm start` commands.
6. Deploy code
```bash
git push heroku master #for master branch
git push heroku main #for main branch
git push heroku <branch_name>:main #for other branch
```

#### New repository deploy
If you dont want to use fork you can initialize new repository
1. Go to folder with your source code
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
5. Follow steps 4-6 from [Fork deploy](#fork-deploy)

### API Extension Registration

After successful deploy application, the last step You need to do is to register your API Extension. You can do it by Heroku CLI.

1. Go you your <application_name> -> More -> Run console
2. Run command `npm run register` 

### CT Configuration

If you use Your CT Application for the first time, You need to configurate it.

1. Go you your <application_name> -> More -> Run console
2. Run command `npm run config` 

This command need to be done only once or if You want to use new CT Application with new credentials.
 
