// #region snippet-config
import Parcel, { Document, DocumentId } from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

interface IOArguments {
    // TODO: Make input addresses optional and allow a single input address
    // to be passed instead of a path to a file of addresses
    inputAddresses?: string;
    outputAddresses?: string;
    downloadPath?: string;
    help?: boolean;
    delete?: boolean;
}

export const args = parse<IOArguments>(
    {
        inputAddresses: {type: String, alias: 'a', optional: true,
            description: 'Optional path to a list of input addresses, one address per line. Documents to be downloaded or deleted based on other arg.'},
        outputAddresses: {type: String, alias: 'o', optional: true,
            description: 'Optional path to write a list of owned addresses, one address per line.'},
        downloadPath: {type: String, alias: 'p', optional: true,
            description: 'Optional path to download files to.'},
        delete: { type: Boolean, optional: true, description: 'If set deletes all Documents listed in the input file.' },
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

    // List owned documents first
    const identity = (await parcel.getCurrentIdentity()).id;
    const documentPage = await parcel.listDocuments({owner: identity, pageSize: 500});

    let outputAddresses : string [] = [];
    documentPage.results.forEach(function (document : Document) {
        // TODO: Skip deactivated datasets
        let title = (document.details)?document.details.title:"-";
        console.log(`${document.id} ${document.owner} ${document.createdAt.toISOString()} ${title} ${document.size}`);
        outputAddresses.push(document.id);
    });

    if(args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses, outputAddresses.join("\n"));
    }

    if(args.inputAddresses) {
        const inputAddresses = fs.readFileSync(args.inputAddresses, 'ascii').split("\n").filter(l => l !== '');
        for(let inputAddress of inputAddresses) {
            if(args.delete) {
                parcel.deleteDocument(inputAddress as DocumentId);
                console.log(`Document ${inputAddress} has been deleted`);
            }
            else {
                if(args.downloadPath) {
                    const download = parcel.downloadDocument(inputAddress as DocumentId);
                    const saver = fs.createWriteStream(`${args.downloadPath}/${inputAddress}`);
                    try {
                      await download.pipeTo(saver);
                      console.log(`Document ${inputAddress} has been downloaded to ${args.downloadPath}`);
                    } catch (error: any) {
                      console.error(`Failed to download document ${inputAddress}`);
                      throw error;
                    }
                }
            }
        }
    }
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });