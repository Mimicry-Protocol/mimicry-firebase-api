# Mimicry API
The Mimicry Protocol helps protect speculators from getting REKT by unlocking illiquid markets.

This API helps lower fees by enabling non-verified price discovery. Whereas actual transactions will use on-chain price discovery using verified oracle contracts.

## Current State
This API is and early-stage alpha build that leverages Google Firebase. Future versions will be more robust.

## Usage
Available POST endpoints include:

#### `https://us-central1-mimicry-api.cloudfunctions.net/publicCollectionIsTradable`
#### `https://us-central1-mimicry-api.cloudfunctions.net/publicCollectionAppraisal`
#### `https://us-central1-mimicry-api.cloudfunctions.net/publicCollectionVisualizer`

Request Body:
```
{
    'slug':'boredapeyachtclub'
}
```

### Local Development Testing
- Emulate Firebase Functions by running `firebase emulators:start` from the `functions` directory of this project.
- Can also use options such as `firebase emulators:start --only "functions"`
- Sometimes emulators don't close their ports properly. Try this on Mac (of course updating it to match the port that was mistakenly left open) `lsof -t -i tcp:8080 | xargs kill`

### Notes on Function Files
- Each function is nested into `./functions/{callType}/{descriptiveName}/*.f.js` and ultimately made available via `./functions/index.js`
- If your new function is not recognized by the system, double check to ensure you have added the .f.js suffix properly.

### Deployment instructions
- Run `firebase deploy` from the root directory of this project.
- or `firebase deploy --only functions`


