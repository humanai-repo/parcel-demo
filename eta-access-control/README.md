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
export RESEARCHER_PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export RESEARCHER_OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
export DATA_OWNER_PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export DATA_OWNER_OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start  -- -i working-data/Paragraphs10.txt -o working-data -n 10 -t "10 Shakespeare Plays"
```
