## API interface

 🚨 All the response should be mapped out to a DTO object so we dont leak stuff. We should not spread, but create a new object.

Currency Pairs

```json
POST /v1/currencies/pairs --- IMO THIS DOESNT SCALE SO MAYBE AN ALTERNATIVE APPROACH
inputParams
{
	from: string[], 
  to: string[]
}
{
  "pairs": [
  {
	  fromCurrency: String,
	  fromNetwork: String,
	  toCurrency: String,
	  toNetwork: String,
  }
  ]
}
------- ALTERNATIVE
POST /v1/networks/inbound => [ **NETWORK_DTO OBJECTS** ]
POST /v1/networks/outbound => [ **NETWORK_DTO OBJECTS** ]
POST /v1/currencies/inbound => [ CURRENCY_DTO **OBJECTS** ] - Given a network
POST /v1/currencies/outbound => [ CURRENCY_DTO **OBJECTS** ] - Given a network
POST /v1/currencies/supported_networks => [ inbound: [NETWORK_DTO OBJECTS], outbound: [NETWORK OBJECTS]]

Implementation guides:
1. We should read all these from cache, 
if they applied a filter, we can potentially filter serverside??? TBD

```

Quote Get 

```json
POST /v1/swap/quote
Inputs {
	fromCurrency: String, // Code
	fromNetwork: String,  // Code
	toCurrency: String,   // Code
	toNetwork: String,    // Code
	fromWalletAddress?: String,  // Ideally this should be enforced, but not sure
	fromWalletAddressExtra?: String, 
	// THESE ARE NEEDED FOR PRICING
	fromAmount?: String, // Either this or toAmount required
	toAmount?: String,   // Either this or fromAmount required
}

Response:
{
  exchangeRate: String,
  fromAmount: String,
  toAmount: String,
  networkFee: String,
 
  fromCurrency: String, // Code
	fromNetwork: String,  // Code
	toCurrency: String,   // Code
	toNetwork: String,    // Code
	
	expiresIn: String, // Seconds until this expires
  
  signature: String // Partner will use this to execute a swap
  // We will use this to encode a bunch of stuff
}

Implementation guides:
1. 
```

Quote Execute 

```json
POST /v1/swap/execute
// MIGHT NEED Either SK or signed by partner
Input
{
  signature: String,
 
 	toWalletAddress: String,  
	toWalletAddressExtra: String, 
	
	refundWalletAddress: String,
	refundWalletAddressExtra: String,
	
	externalId: String, // Can be used by partner to get history
}

Response:
{
	[TRANSACTION_DTO OBJECT],
}
```

Swap Status 

```json
POST /v1/swap/status
Input
{
	id: String; 
}

Response: 
{
	[TRANSACTION_DTO OBJECT]
}

Some implementation ideas:
1. Instead of going directly to DB, maybe cache this 
until the transaction is completed and read by partner, or 30 mins
```

Swaps History

```json
POST /v1/swap/history (or something) Paginated endpoint
Input
{
	externalId?: String, 
	
	createdBeforeDate?: Date, // JS Date
	createdAfterDate?: Date, // JS Date
	
	fromWalletAddress: String,
	fromWalletAddressExtra: String,
	
	toWalletAddress: String,
	toWalletAddressExtra: String,
	
	limit: number, // Default 10, max amount 1000,
	offset: number, // used for pagination
	
	currency: String, // CODE
	network: String,  // CODE
}

Response:
{
	data: [TRANSACTION_DTO OBJECT],
	limit: number,
	offset: number,
	total: number, 
}
```

Get Currencies Info

```json
POST /v1/currencies
Input
{
	currency: String[], // CODE OF CURRENCY
	network: String[], // CODE OF NETWORK
}

Response
{
	[NETWORK_CURRENCY_DTO]
}

Implementation info:
1. Cache response, or maybe even the full table. 
```

Create Webhook

```json
POST /v1/webhooks/create ---- require SK
Input
{
	url: URL; !!!!!! CAREFUL, validate using the same way,
	subscriptions: [], // and array of our enum
}

Response
{
	success: true;
}

// If they create multiple, it will just overwrite the previous one.
```

Get Webhook

```json
POST /v1/webhooks/create ---- require SK
Input
{
 NO INPUT
}

Response
{
	url: URL; !!!!!! CAREFUL, validate using the same way,
	subscriptions: [], // and array of our enum
}

// If they create multiple, it will just overwrite the previous one.
```