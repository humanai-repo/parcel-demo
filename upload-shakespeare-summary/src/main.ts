import Parcel, { Document } from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as process from 'process';
import fs from 'fs';

const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

interface IOArguments {
    inputPath?: string;
    title?: string;
    help?: boolean;
}

export const args = parse<IOArguments>(
    {
        inputPath: {
            type: String, alias: 'i', optional: true,
            description: 'Path to file to upload.'
        },
        title: {
            type: String, alias: 't', optional: true,
            description: 'Title for file.'
        },
        help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
    },
    {
        helpArg: 'help',
    },
);

async function main() {
    const parcel = new Parcel({
        clientId: clientId,
        privateKey: privateKey
    });

    const documentDetails = { title: args.title || '' };

    console.log('Uploading data for our user');
    let doc: Document;

    try {
        doc = await parcel.uploadDocument(
            //await fs.promises.readFile(args.inputPath || ''),
            fs.createReadStream(args.inputPath || ''),
            { details: documentDetails, toApp: undefined }).finished;
    } catch (error: any) {
        console.error('Failed to upload document');
        throw error;
    }
    console.log(
        `Created document ${doc.id} with title ${doc.details.title}`);
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });