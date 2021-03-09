# Delete dataset

A parcel script to list the datasets owned by a user and delete the newest.
This is a convenience script to cleanup after testing.

**This is irreversible.**

## Build

```bash
npm install tslib
npm run-script build
```

## Run

```bash
export OASIS_CLIENT_ID="{OASIS_CLIENT_ID}"
export OASIS_API_PRIVATE_KEY={OASIS_API_PRIVATE_KEY}
npm run-script run
```