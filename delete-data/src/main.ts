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
    console.log(`Listing datasets`);
    const datasets = await identity.getOwnedDatasets();
    let youngestDataset : Parcel.Dataset | undefined;
    for(let dataset of datasets) {
        if(dataset.deactivationTimestamp > new Date(0)) {
            continue;
        }
        console.log(`${dataset.address.hex} ${dataset.creationTimestamp.toISOString()} ${dataset.metadata.title}`);
        if(youngestDataset)
        {
            if(dataset.creationTimestamp > youngestDataset.creationTimestamp) {
                youngestDataset = dataset;
            }
        }
        else
        {
            youngestDataset = dataset;
        }
    }
    // #endregion snippet-dataset-list
    
    // #region snippet-delete-youngest
    if(youngestDataset) {
        console.log(`Deleting ${youngestDataset.address.hex}`);
        await youngestDataset.deactivate();
    }
    else {
        console.log(`Nothing to delete`);
    }
    // #endregion snippet-delete-youngest
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        process.exitCode = 1;
    });