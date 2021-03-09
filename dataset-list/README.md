# Dataset list

A parcel script to list the datasets owned by a user.

## Build

```bash
npm install tslib
npm run-script build
```

## Run

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run-script run
```

This will print the address, created time and title of the owned datasets.

To download a dataset you can use the parcel CLI ([instructions on installing the the parcel CLI](https://docs.oasiscloud.io/latest/getting-started.html#install)).

```bash
parcel get --datasetAddress {DATASET_ADDRESS} --targetPath {OUTPUT_PATH}
```