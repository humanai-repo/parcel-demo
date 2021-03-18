# Dataset list

A parcel script to list the datasets owned by a user.

## Build

```bash
npm i tslib
npm i @oasislabs/parcel
npm run prestart
```

## Run

```bash
export PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start
```

This will print the address, created time and title of the owned datasets.

To download a dataset you can use the parcel CLI ([instructions on installing the the parcel CLI](https://docs.oasiscloud.io/latest/getting-started.html#install)).

TODO: Remove reference to the CLI.

```bash
parcel get --datasetAddress {DATASET_ADDRESS} --targetPath {OUTPUT_PATH}
```