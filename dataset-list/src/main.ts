// #region snippet-config
import * as Parcel from '@oasislabs/parcel-sdk';

const configParams = Parcel.Config.paramsFromEnv();
const config = new Parcel.Config(configParams);
// #endregion snippet-config

async function main() {
    // #region snippet-connect
    // Find the identity address associated with the private key you supplied
    // above.
    const identityAddress = Parcel.Identity.addressFromToken(await config.tokenProvider.getToken());

    // Let's connect to the identity.
    const identity = await Parcel.Identity.connect(identityAddress, config);
    console.log(`Connected to identity at address ${identity.address.hex}`);
    // #endregion snippet-connect

    // #region snippet-dataset-list
    const datasets = await identity.getOwnedDatasets();
    datasets.forEach(function (dataset : Parcel.Dataset) {
        // TODO: Skip deactivated datasets
        console.log(`${dataset.address.hex} ${dataset.creationTimestamp.toISOString()} ${dataset.metadata.title}`);
    });
    // #endregion snippet-dataset-list
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        process.exitCode = 1;
    });