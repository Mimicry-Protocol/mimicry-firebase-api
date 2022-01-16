# Mimicry API
The Mimicry Protocol helps protect speculators from getting REKT by unlocking illiquid markets.

This API helps lower fees by enabling non-verified price discovery. Whereas actual transactions will use on-chain price discovery using verified oracle contracts.

## Current State
This API is and early-stage alpha build that leverages Google Firebase. Future versions will be more robust.

## Usage
Available GET endpoints include:

#### `/public/collection/price`

Request Body:
```
{
    'slug':'theopenseaslug'
}
```

#### `/public/contact/price`

Request Body:
```
{
    'network':'ethereum',
    'address':'thecontractaddress'
}
```



