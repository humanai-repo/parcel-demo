# Extract per play data from Shakespeare plays

Extracts per play data from shakespeare plays. This is in preparation for an
untrusted process to intereact with the data.

Assumes you have followed [Upload Shakespeare Summary](../file-upload/scropts/upload-oss.sh).

## Build

```bash
npm install tslib
npm install ts-command-line-args
npm run-script build
```

## Run

The address of the Shakespeare Paragraph Chunks is printed when running the upload script.
They start "0x...".
Alternatively you can run the [dataset-list](../dataset-list/) script and read it off.

```bash
npm run-script run -- -h

Options

  -a, --inputAddresses string    Path to a list of input addresses, one address per line.                 
  -o, --outputAddresses string   Optional path to write a list of output addresses, one address per line. 
  -n, --count number             The number of unique entities expected.                                  
  -h, --help                     Prints this usage guide    
```

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run-script run  -- -a working-data/input.txt -o working-data/output.txt -n 43
```

## Debugging tips

The docker command executed by the job can be run locally with:

```bash
docker run -v $DATA_DIR:/parcel humansimon/csv-extractor \
  csv_extractor -i /parcel/Paragraphs.txt.chunk1 -i /parcel/Paragraphs.txt.chunk2 \
  -c PlainText --id WorkID -n 43 -p /parcel/ExtratedParagraphs.csv
```
