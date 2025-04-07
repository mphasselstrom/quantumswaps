'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import './swagger-dark.css'
import Header from '@/components/ui/header'

const swaggerSpec = {
  "openapi": "3.0.0",
  "paths": {
    "/v1/currencies/currencies_info": {
      "post": {
        "operationId": "CurrenciesController_getCurrenciesInfo",
        "parameters": [
          {
            "name": "x-pk-key",
            "in": "header",
            "description": "Partner key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CurrenciesInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CurrencyDto"
                }
              }
            }
          }
        },
        "summary": "Get currencies info",
        "tags": [
          "Currencies"
        ]
      }
    },
    "/v1/currencies/networks_info": {
      "post": {
        "operationId": "CurrenciesController_getNetworksInfo",
        "parameters": [
          {
            "name": "x-pk-key",
            "in": "header",
            "description": "Partner key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NetworksInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/NetworkDto"
                }
              }
            }
          }
        },
        "summary": "Get networks info",
        "tags": [
          "Currencies"
        ]
      }
    },
    "/v1/currencies/pairs": {
      "post": {
        "operationId": "CurrenciesController_pairs",
        "parameters": [
          {
            "name": "x-pk-key",
            "in": "header",
            "description": "Partner key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PairsInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PairsOutputDto"
                }
              }
            }
          }
        },
        "summary": "Get pairs",
        "tags": [
          "Currencies"
        ]
      }
    },
    "/v1/swap/quote": {
      "post": {
        "operationId": "SwapsController_quote",
        "parameters": [
          {
            "name": "x-sk-key",
            "in": "header",
            "description": "Signing key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/QuoteInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/QuoteOutputDto"
                }
              }
            }
          }
        },
        "summary": "Get swap quote",
        "tags": [
          "Swaps"
        ]
      }
    },
    "/v1/swap/execute": {
      "post": {
        "operationId": "SwapsController_execute",
        "parameters": [
          {
            "name": "x-sk-key",
            "in": "header",
            "description": "Signing key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ExecuteSwapInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransactionDto"
                }
              }
            }
          }
        },
        "summary": "Execute a swap",
        "tags": [
          "Swaps"
        ]
      }
    },
    "/v1/swap/history": {
      "post": {
        "operationId": "SwapsController_history",
        "parameters": [
          {
            "name": "x-sk-key",
            "in": "header",
            "description": "Signing key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SwapHistoryInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SwapHistoryOutputDto"
                }
              }
            }
          }
        },
        "summary": "Get swap history",
        "tags": [
          "Swaps"
        ]
      }
    },
    "/v1/swap/status": {
      "post": {
        "operationId": "SwapsController_status",
        "parameters": [
          {
            "name": "x-pk-key",
            "in": "header",
            "description": "Partner key",
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SwapStatusInputDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/TransactionDto"
                }
              }
            }
          }
        },
        "summary": "Get swap transaction with status",
        "tags": [
          "Swaps"
        ]
      }
    },
    "/health": {
      "get": {
        "operationId": "HealthCheckController_fetch",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "HealthCheck"
        ]
      }
    }
  },
  "info": {
    "title": "Swaps API",
    "description": "The Swaps API description",
    "version": "1.0",
    "contact": {}
  },
  "tags": [],
  "servers": [],
  "components": {
    "securitySchemes": {
      "bearer": {
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "type": "http"
      }
    },
    "schemas": {
      "CurrenciesInputDto": {
        "type": "object",
        "properties": {
          "currencies": {
            "description": "The currencies to get",
            "example": [
              "eth",
              "usdt"
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "search": {
            "type": "string",
            "description": "The currency codes to search",
            "example": "usd"
          }
        },
        "required": [
          "currencies",
          "search"
        ]
      },
      "CurrencyDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The ID of the currency",
            "example": "123e4567-e89b-12d3-a456-426614174000"
          },
          "code": {
            "type": "string",
            "description": "The code of the currency",
            "example": "eth"
          },
          "name": {
            "type": "string",
            "description": "The name of the currency",
            "example": "Ethereum"
          },
          "imageUrl": {
            "type": "string",
            "description": "The image URL of the currency",
            "example": "https://example.com/image.png"
          },
          "isEnabled": {
            "type": "boolean",
            "description": "Whether the currency is enabled",
            "example": true
          },
          "requiresExtraTag": {
            "type": "boolean",
            "description": "Whether the currency requires an extra tag",
            "example": true
          }
        },
        "required": [
          "id",
          "code",
          "name",
          "imageUrl",
          "isEnabled",
          "requiresExtraTag"
        ]
      },
      "NetworksInputDto": {
        "type": "object",
        "properties": {
          "networks": {
            "description": "The networks to get",
            "example": [
              "eth",
              "usdt"
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "networks"
        ]
      },
      "NetworkDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The ID of the network",
            "example": "123e4567-e89b-12d3-a456-426614174000"
          },
          "code": {
            "type": "string",
            "description": "The code of the network",
            "example": "eth"
          },
          "name": {
            "type": "string",
            "description": "The name of the network",
            "example": "Ethereum"
          },
          "imageUrl": {
            "type": "string",
            "description": "The image URL of the network",
            "example": "https://example.com/image.png"
          },
          "transactionUrl": {
            "type": "string",
            "description": "The transaction URL of the network",
            "example": "https://example.com/transaction.png"
          },
          "addressUrl": {
            "type": "string",
            "description": "The address URL of the network",
            "example": "https://example.com/address.png"
          },
          "addressRegex": {
            "type": "string",
            "description": "The address regex of the network",
            "example": "https://example.com/address.png"
          },
          "addressTagRegex": {
            "type": "string",
            "description": "The address tag regex of the network",
            "example": "https://example.com/address.png"
          }
        },
        "required": [
          "id",
          "code",
          "name",
          "imageUrl",
          "transactionUrl",
          "addressUrl",
          "addressRegex",
          "addressTagRegex"
        ]
      },
      "PairsInputDto": {
        "type": "object",
        "properties": {
          "fromCurrencies": {
            "description": "The currencies to get",
            "example": [
              "eth",
              "usdt"
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "toCurrencies": {
            "description": "The currencies to get",
            "example": [
              "eth",
              "usdt"
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "fromNetworks": {
            "description": "The networks to get",
            "example": [
              "eth",
              "usdt"
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "toNetworks": {
            "description": "The networks to get",
            "example": [
              "eth",
              "usdt"
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "search": {
            "type": "string",
            "description": "The term to search",
            "example": "usd"
          }
        },
        "required": [
          "fromCurrencies",
          "toCurrencies",
          "fromNetworks",
          "toNetworks",
          "search"
        ]
      },
      "PairsOutputDto": {
        "type": "object",
        "properties": {
          "pairs": {
            "description": "The pairs",
            "example": [
              {
                "fromCurrency": "eth",
                "fromNetwork": "eth",
                "toCurrency": "usdt",
                "toNetwork": "usdt"
              }
            ],
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "pairs"
        ]
      },
      "QuoteInputDto": {
        "type": "object",
        "properties": {
          "fromCurrency": {
            "type": "string",
            "description": "The currency of the swap",
            "example": "eth"
          },
          "fromNetwork": {
            "type": "string",
            "description": "The network of the swap",
            "example": "eth"
          },
          "fromWalletAddress": {
            "type": "string",
            "description": "The wallet address of the sender",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "fromWalletAddressExtra": {
            "type": "string",
            "description": "The extra data of the sender",
            "example": "exampleTag"
          },
          "fromAmount": {
            "type": "string",
            "description": "The amount of the swap",
            "example": "1"
          },
          "toAmount": {
            "type": "string",
            "description": "The amount of the swap",
            "example": "1"
          },
          "toCurrency": {
            "type": "string",
            "description": "The currency of the swap",
            "example": "eth"
          },
          "toNetwork": {
            "type": "string",
            "description": "The network of the swap",
            "example": "eth"
          },
          "flow": {
            "type": "string",
            "description": "The flow of the swap",
            "example": "standard"
          }
        },
        "required": [
          "fromCurrency",
          "fromNetwork",
          "fromWalletAddress",
          "fromWalletAddressExtra",
          "fromAmount",
          "toAmount",
          "toCurrency",
          "toNetwork",
          "flow"
        ]
      },
      "QuoteOutputDto": {
        "type": "object",
        "properties": {
          "fromAmount": {
            "type": "string",
            "description": "The amount of the quote from the sender",
            "example": "1"
          },
          "toAmount": {
            "type": "string",
            "description": "The amount of the quote to the receiver",
            "example": "1"
          },
          "networkFee": {
            "type": "string",
            "description": "The network fee of the quote",
            "example": "1"
          },
          "fromCurrency": {
            "type": "string",
            "description": "The currency of the quote from the sender",
            "example": "eth"
          },
          "fromNetwork": {
            "type": "string",
            "description": "The network of the quote from the sender",
            "example": "eth"
          },
          "toCurrency": {
            "type": "string",
            "description": "The currency of the quote to the receiver",
            "example": "eth"
          },
          "toNetwork": {
            "type": "string",
            "description": "The network of the quote to the receiver",
            "example": "eth"
          },
          "expiresIn": {
            "type": "string",
            "description": "No of seconds before the quote expires",
            "example": "1"
          },
          "signature": {
            "type": "string",
            "description": "The signature of the quote",
            "example": "1"
          },
          "flow": {
            "type": "string",
            "description": "The flow of the quote",
            "example": "standard"
          },
          "fromWalletAddress": {
            "type": "string",
            "description": "The wallet address of the sender",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "fromWalletAddressExtra": {
            "type": "string",
            "description": "The extra data of the sender",
            "example": "exampleTag"
          }
        },
        "required": [
          "fromAmount",
          "toAmount",
          "networkFee",
          "fromCurrency",
          "fromNetwork",
          "toCurrency",
          "toNetwork",
          "expiresIn",
          "signature",
          "flow",
          "fromWalletAddress",
          "fromWalletAddressExtra"
        ]
      },
      "ExecuteSwapInputDto": {
        "type": "object",
        "properties": {
          "signature": {
            "type": "string",
            "description": "The signature of the swap",
            "example": "xxxxx"
          },
          "toWalletAddress": {
            "type": "string",
            "description": "The wallet address to send the tokens to",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "toWalletAddressExtra": {
            "type": "string",
            "description": "The extra data to send to the wallet",
            "example": "exampleTag"
          },
          "refundWalletAddress": {
            "type": "string",
            "description": "The wallet address to refund the tokens to",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "refundWalletAddressExtra": {
            "type": "string",
            "description": "The extra data to send to the refund wallet",
            "example": "exampleTag"
          },
          "externalId": {
            "type": "string",
            "description": "The external ID of the swap",
            "example": "1234567890"
          }
        },
        "required": [
          "signature",
          "toWalletAddress",
          "toWalletAddressExtra",
          "refundWalletAddress",
          "refundWalletAddressExtra",
          "externalId"
        ]
      },
      "TransactionDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The ID of the transaction",
            "example": "123e4567-e89b-12d3-a456-426614174000"
          },
          "fromCurrency": {
            "type": "string",
            "description": "The currency of the transaction",
            "example": "eth"
          },
          "fromNetwork": {
            "type": "string",
            "description": "The network of the transaction",
            "example": "eth"
          },
          "fromAmount": {
            "type": "string",
            "description": "The amount of the transaction from the sender",
            "example": "1"
          },
          "fromWalletAddress": {
            "type": "string",
            "description": "The wallet address of the sender",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "fromWalletAddressExtra": {
            "type": "string",
            "description": "The extra data of the sender",
            "example": "exampleTag"
          },
          "toCurrency": {
            "type": "string",
            "description": "The currency of the transaction",
            "example": "eth"
          },
          "toNetwork": {
            "type": "string",
            "description": "The network of the transaction",
            "example": "eth"
          },
          "toAmount": {
            "type": "string",
            "description": "The amount of the transaction to the receiver",
            "example": "1"
          },
          "toWalletAddress": {
            "type": "string",
            "description": "The wallet address of the receiver",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "toWalletAddressExtra": {
            "type": "string",
            "description": "The extra data of the receiver",
            "example": "exampleTag"
          },
          "externalId": {
            "type": "string",
            "description": "The external ID of the transaction",
            "example": "1234567890"
          },
          "status": {
            "type": "string",
            "description": "The status of the transaction",
            "example": "pending"
          },
          "completedAt": {
            "format": "date-time",
            "type": "string",
            "description": "The date and time the transaction was completed",
            "example": "2021-01-01T00:00:00.000Z"
          },
          "depositAddress": {
            "type": "string",
            "description": "The deposit address of the transaction",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "depositExtraId": {
            "type": "string",
            "description": "The deposit extra ID of the transaction",
            "example": "1234567890"
          }
        },
        "required": [
          "id",
          "fromCurrency",
          "fromNetwork",
          "fromAmount",
          "fromWalletAddress",
          "fromWalletAddressExtra",
          "toCurrency",
          "toNetwork",
          "toAmount",
          "toWalletAddress",
          "toWalletAddressExtra",
          "externalId",
          "status",
          "completedAt",
          "depositAddress",
          "depositExtraId"
        ]
      },
      "SwapHistoryInputDto": {
        "type": "object",
        "properties": {
          "externalId": {
            "type": "string",
            "description": "The external ID of the swap",
            "example": "1234567890"
          },
          "createdBeforeDate": {
            "format": "date-time",
            "type": "string",
            "description": "The date before which the swap was created",
            "example": "2021-01-01"
          },
          "createdAfterDate": {
            "format": "date-time",
            "type": "string",
            "description": "The date after which the swap was created",
            "example": "2021-01-01"
          },
          "fromWalletAddress": {
            "type": "string",
            "description": "The wallet address of the sender",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "fromWalletAddressExtra": {
            "type": "string",
            "description": "The extra data of the sender",
            "example": "exampleTag"
          },
          "toWalletAddress": {
            "type": "string",
            "description": "The wallet address of the receiver",
            "example": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          },
          "toWalletAddressExtra": {
            "type": "string",
            "description": "The extra data of the receiver",
            "example": "exampleTag"
          },
          "limit": {
            "type": "number",
            "description": "The limit of the number of swaps to return",
            "example": 10
          },
          "offset": {
            "type": "number",
            "description": "The offset of the swaps to return",
            "example": 0
          },
          "currency": {
            "type": "string",
            "description": "The currency of the swaps to return",
            "example": "eth"
          },
          "network": {
            "type": "string",
            "description": "The network of the swaps to return",
            "example": "eth"
          }
        },
        "required": [
          "externalId",
          "createdBeforeDate",
          "createdAfterDate",
          "fromWalletAddress",
          "fromWalletAddressExtra",
          "toWalletAddress",
          "toWalletAddressExtra",
          "limit",
          "offset",
          "currency",
          "network"
        ]
      },
      "SwapHistoryOutputDto": {
        "type": "object",
        "properties": {
          "data": {
            "description": "The data of the swaps",
            "example": [],
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "limit": {
            "type": "number",
            "description": "The limit of the swaps",
            "example": 10
          },
          "offset": {
            "type": "number",
            "description": "The offset of the swaps",
            "example": 0
          },
          "total": {
            "type": "number",
            "description": "The total number of swaps",
            "example": 100
          }
        },
        "required": [
          "data",
          "limit",
          "offset",
          "total"
        ]
      },
      "SwapStatusInputDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "The ID of the swap",
            "example": "123e4567-e89b-12d3-a456-426614174000"
          }
        },
        "required": [
          "id"
        ]
      }
    }
  }
}

export default function SwaggerPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <Header />
      <main className="grow bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div className="max-w-3xl mx-auto mb-10">
              <h1 className="h2 mb-4 text-center text-white">API Documentation</h1>
              <div className="text-center">
                <p className="text-xl text-slate-400">Complete API reference for Quantum</p>
                <div className="mt-6 flex justify-center">
                  <div className="inline-flex bg-slate-800/30 rounded-full p-1 border border-slate-700/50">
                    <span className="px-3 py-1 text-sm font-medium text-white">OpenAPI 3.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-6xl mx-auto swagger-container bg-slate-800/80 backdrop-blur-sm p-5 rounded-xl border border-slate-700/80 shadow-xl">
              {isClient && (
                <SwaggerUI 
                  spec={swaggerSpec}
                  docExpansion="list"
                  deepLinking={true}
                  displayOperationId={false}
                  defaultModelsExpandDepth={-1}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 