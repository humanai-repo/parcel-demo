import Parcel, { InputDocumentSpec, OutputDocumentSpec, Job, JobSpec, JobPhase, DocumentId, IdentityId } from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

// As of Parcel 0.1.9, there is an effective restriction on the number of input files.
// To work around this just run the job multiple times only mounting batches of 10 output
// files for each run.
const maxInputFilesPerJob = 10;


interface IOArguments {
    // TODO: Make input addresses optional and allow a single input address
    // to be passed instead of a path to a file of addresses
    inputAddresses?: string;
    outputAddresses?: string;
    count?: number;
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
        count: {
            type: Number, alias: 'n', optional: true,
            description: 'The number of unique entities expected.'
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

async function extract(inputAddresses: string[], shakespeareNPlays: Number,
    identity: IdentityId, parcel: Parcel) {
    const outputFileNamePrefix = "ExtratedParagraphs";
    const inputFileNamePrefix = "InputChunk";

    var inputDocuments: InputDocumentSpec[] = [];
    var inputCmd: string[] = [];
    for (let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDocuments.push({ mountPath: fileName, id: inputAddresses[i] as DocumentId });
        inputCmd.push('-i', filePath);
    }

    var outputDocuments: OutputDocumentSpec[][] = [];
    for (let i = 0; i < shakespeareNPlays; i++) {
        let j = Math.floor(i / maxInputFilesPerJob);
        if (i % maxInputFilesPerJob == 0) {
            outputDocuments.push([]);
        }
        outputDocuments[j].push({ mountPath: `${outputFileNamePrefix}-${i}.csv`, owner: identity })
    }

    var cmd = [
        'csv_extractor',
        '-c',
        'PlainText',
        '--id',
        'WorkID',
        '-n',
        `${shakespeareNPlays}`,
        '-p',
        `/parcel/data/out/${outputFileNamePrefix}`,
    ].concat(inputCmd);

    let jobSpecs = outputDocuments.map(
        (o) => {
            return {
                name: 'extractor-shakespeare',
                image: 'humansimon/csv-extractor',
                inputDocuments: inputDocuments,
                outputDocuments: o,
                cmd: cmd,
            };
        });
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

    const inputAddresses = fs.readFileSync(args.inputAddresses || '', 'ascii').
        split("\n").filter(l => l !== '');
    const shakespeareNPlays = args.count || 0;

    let outputAddresses =
        await extract(inputAddresses, shakespeareNPlays, identity, parcel);
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
