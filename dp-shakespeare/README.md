# Differentially Private Shakespeare

Calculate a differentially private wordcount across shakespearse plays.
Takes as input a summary of Shakespeare's places and executes a differentially
private summary.

Assumes you have followed [Upload Shakespeare Summary](../upload-shakespeare-summary/).

## Build

```bash
npm install tslib
npm install ts-command-line-args
npm run-script build
```

## Run

The address of the Shakespeare summary is printed when running the upload script. It starts "0x...".

```bash
npm run-script run -- -h

Options

  -a, --inputAddresses string    Path to a list of input addresses, one address per line.                 
  -o, --outputAddresses string   Optional path to write a list of output addresses, one address per line. 
  -h, --help                     Prints this usage guide  
```

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run-script run  -- -a working-data/input.txt -o working-data/output.txt
```

Instructions on reading the output can be found in the [Dataset List Readme](../dataset-list/).

## Debugging tips

The docker command executed by the job can be run locally with:

```bash
docker run -v $PWD/../upload-shakespeare-summary/data:/parcel humansimon/pydp-cli pydp-cli -i /parcel/shakespeare_wc.csv -c words -a mean -a sum -e 5 -o /parcel/shakespeare_summary.txt
```
