import Parcel, { InputDocumentSpec, OutputDocumentSpec, Job, JobSpec, JobPhase, DocumentId, IdentityId } from '@oasislabs/parcel';
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
    help?: boolean;
}

export const args = parse<IOArguments>(
    {
        inputAddresses: {
            type: String, alias: 'a', optional: true,
            description: 'Path to a list of input addresses, one address per line.'
        },
        outputAddresses: {
            type: String, alias: 'o', optional: true,
            description: 'Optional path to write a list of output addresses, one address per line.'
        },
        help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
    },
    {
        helpArg: 'help',
    },
);

async function submitJobSpecs(jobSpecs: JobSpec[], parcel: Parcel) {
    let outputAddresses: string[] = [];
    // TODO: This submits each job sequentially -- swap to ascync
    for (let jobSpec of jobSpecs) {
        console.log(jobSpec.cmd.join(" "));
        let jobId = (await parcel.submitJob(jobSpec)).id;
        console.log(`Job ${jobId} submitted.`);

        // Wait for job completion.
        let job: Job;
        do {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
            job = await parcel.getJob(jobId);
            console.log(`Job status is ${JSON.stringify(job.status)}`);
        } while (job.status.phase === JobPhase.PENDING ||
            job.status.phase === JobPhase.RUNNING);

        if (job.status.phase === JobPhase.SUCCEEDED) {
            console.log('Job completed successfully!');
        } else {
            console.log('Job failed!');
            console.log('Exiting with falure status code 1');
            return process.exit(1);
        }
        outputAddresses = outputAddresses.concat(
            job.status.outputDocuments.map((o) => { return o.id; }));
    }
    return outputAddresses;
}

async function transform(inputAddresses: string[], identity: IdentityId,
    parcel: Parcel) {
    let jobSpecs = inputAddresses.map(
        (i) => {
            console.log(i);
            return {
                name: 'transform-shakespeare',
                image: 'humansimon/simple-transform',
                inputDocuments: [{ mountPath: 'input.csv', id: i as DocumentId },],
                outputDocuments: [{ mountPath: 'output.csv', owner: identity }],
                cmd: [
                    'simple_transform',
                    '-i',
                    '/parcel/data/in/input.csv',
                    '-c',
                    'PlainText',
                    '--index',
                    i,
                    '-o',
                    '/parcel/data/out/output.csv',
                ],
            };
        }
    );
    return submitJobSpecs(jobSpecs, parcel);
}

async function main() {
    console.log('Here we go...');

    const parcel = new Parcel({
        clientId: clientId,
        privateKey: privateKey
    });
    console.log('Retrieving identity');
    const identity = (await parcel.getCurrentIdentity()).id;


    let inputAddresses =
        fs.readFileSync(args.inputAddresses || '', 'ascii').
            split("\n").filter(l => l !== '');


    let outputAddresses = await transform(inputAddresses, identity, parcel);

    // Write the out addresses to the output file if set
    if (args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses, outputAddresses.join("\n"));
    }
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });
