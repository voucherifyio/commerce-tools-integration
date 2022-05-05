CommerceTools, bedzie po polsku :)

1. w CT dashboard trzeba wygenerować token który pozwoli nam korzytać z API
````
   Client credential flow
   More information
   Use these credentials to access the project via API:
   doc_test1

   project_key
   doc_test1
    
   client_id
   NqsdRATCPwwrbOMCjo8r8JdD
    
   secret
   CvMYnRjKtn1CWezNfQfRARQ12rC2xHp4
    
   scope
   manage_project:doc_test1
    
   API URL
   https://api.europe-west1.gcp.commercetools.com
    
   Auth URL
   https://auth.europe-west1.gcp.commercetools.com
````

Następnie musimy 'uderzyć' endpoint `Auth URL/oauth/token` stawiając body x-www-form-urlencoded
key: `grant_type` with value: `client_credentials` ustawiając również `Basic Auth` with username: `client_id` and password: `secret`

w ten sposób uzyskamy `access_token`:
````JSON
{
    "access_token": "q4WPs46UFOLos3yJfBHCuDJO_NnQxC_q",
    "token_type": "Bearer",
    "expires_in": 172800,
    "scope": "manage_project:doc_test1"
}
````


Rodzaje zniżek: 
1. `setLineItemPrice`
example:
można zmieniać wiele cen produktów w jednym zapytaniu
````JSON
{
    "version": 11,
    "actions": [{
        "action":"setLineItemPrice",
        "lineItemId":"8642d467-3749-4178-9f60-0752e1a65e5a",
        "externalPrice": {
            "currencyCode": "USD",
            "centAmount": 2000
        }
    },{
        "action":"setLineItemPrice",
        "lineItemId":"8642d467-3749-4178-9f60-0752e1a65e5a",
        "externalPrice": {
            "currencyCode": "USD",
            "centAmount": 3000
        }
    }]
}
````

2. product discounts:
   https://docs.commercetools.com/api/projects/productDiscounts#productdiscountvalue
   (nie potrafie tego jeszcze wyklikać) :) 


* `type - relative`  - procentowo
* `type - absolute`  - o okresloną kwotę
* `type - external`  - identycznie jak w punkcie 1

3. cart discounts:
   https://docs.commercetools.com/api/projects/cartDiscounts#relative

* `type - relative`  - procentowo
* `type - absolute`  - o okresloną kwotę
* `type - fixed`  - określa niejako maksymalną kwotę koszyka zakupowego :)