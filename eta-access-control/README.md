# Extract Transform Load - Access Control Tests

Runs a full ETA pipeline including interactions between parties.
Includes tests.

## Build

```bash
npm i tslib
npm i ts-command-line-args
npm i @oasislabs/parcel
npm run prestart
```

## Run

The address of the Shakespeare Paragraph Chunks is printed when running the upload script.
Alternatively you can run the [dataset-list](../dataset-list/) script and read it off.

```bash
npm run start -- -h

Options

  -a, --inputAddresses string    Path to a list of input addresses, one address per line.                 
  -o, --outputAddresses string   Optional path to write a list of output addresses, one address per line. 
  -n, --count number             The number of unique entities expected.                                  
  -h, --help                     Prints this usage guide    
```

```bash
export PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start  -- -a working-data/input.txt -o working-data/output.txt -n 43
```
