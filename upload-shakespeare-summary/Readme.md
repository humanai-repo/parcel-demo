# Upload Shakespeare Summary
Uploads a file to Parcel at a specified path with a specified title.

This has been designed to work as part of the demo to calculate the mean number
of words in a Shakespeare play in a secure and private manner.

The referenced input file is Paragraphs.txt from oss-textdb.zip downloaded from
the [Open Shakespeare Project](https://www.opensourceshakespeare.org/downloads/).

## Build

```bash
npm i tslib
npm i @oasislabs/parcel
npm i ts-command-line-args
npm run prestart
```

## Run

Requires an App to be setup through the Parcel Portal --
[details here](https://docs.oasiscloud.io/latest/getting-started.html).

```bash
export PARCEL_CLIENT_ID="{PARCEL_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run start -- -i working-data/Paragraphs.txt -t "Shakespeare Plays"
```

## References

Open Sources Shakespeare is a George Mason University project. Full details can
be found at
[www.opensourceshakespeare.org](http://www.opensourceshakespeare.org).