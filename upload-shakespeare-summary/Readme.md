# Upload Shakespeare Summary

Uploads a CSV to Parcel sumarising shakespeare plays.

[shakespeare_wc.csv](data/shakespeare_wc.csv) is a CSV file with two columns,
the filename of a shakespeare play and the number of words in that file.

The Upload Shakespeare Summary Parcel script uploads that file to parcel.

Based on Oasis Labs [data upload example](https://github.com/oasislabs/parcel-examples/tree/latest/data-upload).

## Build

```bash
npm i tslib
npm i @oasislabs/parcel
npm run prestart
```

## Run

TODO: Change the Portal address.

Requires an App to be setup through the [Parcel Portal](https://portal.oasiscloud.io/) --
[details here](https://docs.oasiscloud.io/latest/getting-started.html).

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start
```

After the upload the data should be visible in the parcel portal.