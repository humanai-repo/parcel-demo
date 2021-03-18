// #region snippet-config
import Parcel, { Document } from '@oasislabs/parcel';
import * as process from 'process';

//const configParams = Parcel.Config.paramsFromEnv();
//const config = new Parcel.Config(configParams);
// #endregion snippet-config

const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

async function main() {
    const parcel = new Parcel({
      clientId: clientId,
      privateKey: privateKey
    });

    // TODO: Add paging
    const documentPage = await parcel.listDocuments();

    documentPage.results.forEach(function (document : Document) {
        // TODO: Skip deactivated datasets
        console.log(`${document.id} ${document.owner} ${document.createdAt.toISOString()} ${document.details.title} ${document.size}`);
    });
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });