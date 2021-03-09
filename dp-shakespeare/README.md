# Differentially Private Shakespeare

Calculate a differentially private wordcount across shakespearse plays.
Takes as input a summary of Shakespeare's places and executes a differentially
private summary.

Assumes you have followed [Upload Shakespeare Summary](../upload-shakespeare-summary/).

## Build

```bash
npm install tslib
npm run-script build
```

## Run

The address of the Shakespeare summary is printed when running the upload script. It starts "0x...".

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
export SHAKESPEARE_ADDRESS={SHAKESPEARE_ADDRESS}
npm run-script run
```

Instructions on reading the output can be dound in the [Dataset List Readme](../dataset-list/).

## Debugging tips

The docker command executed by the job can be run locally with:

```bash
docker run -v $PWD/../upload-shakespeare-summary/data:/parcel humansimon/pydp-cli pydp-cli -i /parcel/shakespeare_wc.csv -c words -a mean -a sum -e 5 -o /parcel/shakespeare_summary.txt
```
