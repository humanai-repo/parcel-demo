# parcel-demo
 A human.ai technology demonstration using
 [Oasis Lab's](https://www.oasislabs.com/) Parcel API.


## Differentially private Shakespeare

Differentially private Shakespeare is a two part demo showing how one can
perform a differentially private query across someone elses data. The data
in the example is a summary of Shakespeares plays.

 1. Alice [uploads](file-upload) the data,
 1. Bob performs a 3-stage [differentially private](eta-shakespeare) query over the data.

The repo also includes [dataset handling functions](data-utils).

## Disclaimer

The code here is strictly a technology demonstration and should not be used in
a production environment.