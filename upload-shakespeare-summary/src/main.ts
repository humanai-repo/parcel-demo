// #region snippet-config
import * as Parcel from '@oasislabs/parcel-sdk';
import fs from 'fs';

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

    // #region snippet-dataset-upload
    // Now let's upload a dataset.
    const datasetMetadata = {
        title: 'Shakespeare Summary',
    };

    console.log('Uploading data for our user');
    const dataset = await Parcel.Dataset.upload(
        await fs.promises.readFile('data/shakespeare_wc.csv'), datasetMetadata, identity, config);
    // `dataset.address.hex` is your dataset's unique ID.
    console.log(
        `Created dataset with address ${dataset.address.hex} and uploaded to ${dataset.metadata.dataUrl}`,
    );
    // #endregion snippet-dataset-upload

    // TODO: Set a policy on the data.
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        process.exitCode = 1;
    });