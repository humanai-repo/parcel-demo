# Data Utils

A script to monitor jobs.

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

  -j, --jobs string    			 Path to a list of jobs to monitor, one Job ID per line.        
  -o, --outputAddresses string   Optional path to write a list of owned addresses, one address per line. 
  -h, --help                     Prints this usage guide    
```

```bash
export PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start
```