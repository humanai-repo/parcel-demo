# Extract per play data from Shakespeare plays

Extracts per play data from shakespeare plays. This is in preparation for an
untrusted process to intereact with the data.

Assumes you have followed [Upload Shakespeare Summary](../file-upload/scropts/upload-oss.sh).

## Build

```bash
npm install tslib
npm run-script build
```

## Run

The address of the Shakespeare Paragraph Chunks is printed when running the upload script.
They start "0x...".
Alternatively you can run the [dataset-list](../dataset-list/) script and read it off.

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
export SHAKESPEARE_PARA1_ADDRESS={SHAKESPEARE_PARA1_ADDRESS}
export SHAKESPEARE_PARA2_ADDRESS={SHAKESPEARE_PARA2_ADDRESS}
export SHAKESPEARE_N_PLAYS=43
npm run-script run
```

Instructions on reading the output can be found in the [Dataset List Readme](../dataset-list/).

## Debugging tips

The docker command executed by the job can be run locally with:

```bash
docker run -v $DATA_DIR:/parcel humansimon/csv-extractor \
  csv_extractor -i /parcel/Paragraphs.txt.chunk1 -i /parcel/Paragraphs.txt.chunk2 \
  -c PlainText --id WorkID -n 43 -p /parcel/ExtratedParagraphs.csv
```
