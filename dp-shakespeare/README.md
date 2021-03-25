# Differentially Private Shakespeare

Calculate a differentially private wordcount across shakespearse plays.
Takes as input a summary of Shakespeare's places and executes a differentially
private summary.

Input format is CSV files including a column named "words" containing a
wordcount.

Assumes you have run [Transform Shakespeare](../transform-shakespeare).

## Build

```bash
npm i tslib
npm i ts-command-line-args
npm i @oasislabs/parcel
npm run prestart
```

## Run

```bash
npm run start -- -h

Options

  -a, --inputAddresses string    Path to a list of input addresses, one address per line.                 
  -o, --outputAddresses string   Optional path to write a list of output addresses, one address per line. 
  -h, --help                     Prints this usage guide  
```

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start  -- -a working-data/input.txt -o working-data/output.txt
```

The output can be read using the parcel CLI

```bash
parcel get --datasetAddress `cat working-data/output.txt` --targetPath working-data/outputfile.csv
cat working-data/outputfile.csv
```

## Debugging tips

The docker command executed by the job can be run locally with:

```bash
docker run -v $PWD/../upload-shakespeare-summary/data:/parcel humansimon/pydp-cli pydp-cli -i /parcel/shakespeare_wc.csv -c words -a mean -a sum -e 5 -o /parcel/shakespeare_summary.txt
```
