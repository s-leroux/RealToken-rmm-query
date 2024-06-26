# realtoken-rmm-query

An attempt to read data from the RealT RMM platform
https://rmm.realtoken.network/

## 1. Set up your `.env` file:
```
THEGRAPH_API_KEY=...
MY_WALLET=0x...
```

## 2. Compile:
In a shell type:
```
npm run-script build-container
npm run-script shell
yarn install
yarn tsc --watch
```

## 3. Run:
In another shell type:
```
npm run-script shell
yarn start
```

