// #region snippet-config
import Parcel, { Document } from '@oasislabs/parcel';
import * as process from 'process';
import fs from 'fs';

const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

async function main() {
    const parcel = new Parcel({
      clientId: clientId,
      privateKey: privateKey
    });

    const documentDetails = {title: 'Shakespeare Paragraphs'};

    console.log('Uploading data for our user');
    let document: Document;

    try {
        document = await parcel.uploadDocument(
            await fs.promises.readFile('working-data/Paragraphs1.txt'), {details: documentDetails}).finished;
    } catch (error: any) {
          console.error('Failed to upload document');
      throw error;
    }
    // #endregion snippet-dataset-upload
    console.log(`Created document ${document.id} with title ${document.details.title}`);

    // TODO: Set a policy on the data.
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });