# Data Utils

A script to list, download and delete datasets owned by a user.
This is a convenience script to cleanup after testing.

**Deleting is irreversible.**

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

  -a, --inputAddresses string    Optional path to a list of input addresses, one address per line.        
                                 Documents to be downloaded or deleted based on other arg.                
  -o, --outputAddresses string   Optional path to write a list of owned addresses, one address per line.  
  -p, --downloadPath string      Optional path to download files to.                                      
  --delete                       If set deletes all Documents listed in the input file.                   
  -h, --help                     Prints this usage guide    
```

```bash
export PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start
```