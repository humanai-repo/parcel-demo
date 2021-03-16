# Extract Transform Aggregate pipeline
An example "extract, transform, aggregate" pipeline querying a shakespeare play.

Ties together [Extract](../extractor-shakespeare),
[Transform](../transform-shakespeare) and [Aggregate](../dp-shakespeare)
querying the mean number of words in a shakespeare play without having access
to the underlyng plays.

## Build

Follow the individual build instructions for the different projects.

## Run

Assumes you have followed [Upload Shakespeare Summary](../file-upload/scropts/upload-oss.sh).

The arguments are:
 *  a file of input addresses with one line per address, and
 *  the number of shakespeare plays.

`bash
bash scripts/eta-sharkespeare.sh input_addresses.txt 43
`