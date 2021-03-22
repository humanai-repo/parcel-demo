# Applies a transform to a Shakespeare play

Applies a transform to the text of a Shakespeare plays extracted with
[extractor](../extractor-shakespeare). The specific transformation performed
is a word-count.

Computation is performed inside a csvkit docker container which is likely
over-kill however works for the technology demonstration.

## Build

```bash
npm i tslib
npm i @oasislabs/parcel
npm i ts-command-line-args
npm run prestart
```

## Run

A file of input addresses, one address per line, is passed in as a command line arg.
An analogous output file is written.

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
npm run start -- -a working-data/input.txt -o working-data/output.txt
```

