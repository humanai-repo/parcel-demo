import Parcel, {InputDocumentSpec, OutputDocumentSpec, Job, JobSpec, JobPhase, DocumentId, IdentityId} from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

// #region snippet-config
const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

const maxInputFilesPerJob = 10;

interface IOArguments {
    // TODO: Make input addresses optional and allow a single input address
    // to be passed instead of a path to a file of addresses
    inputAddresses?: string;
    outputAddresses?: string;
    help?: boolean;
}

export const args = parse<IOArguments>(
    {
        inputAddresses: {type: String, alias: 'a', optional: true,
            description: 'Path to a list of input addresses, one address per line.'},
        outputAddresses: {type: String, alias: 'o', optional: true,
            description: 'Optional path to write a list of output addresses, one address per line.'},
        help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
    },
    {
        helpArg: 'help',
    },
);
// #endregion snippet-config

async function submitJobSpecs(jobSpecs : JobSpec [], parcel : Parcel) {
    let outputAddresses: string[] = [];
    // TODO: This submits each job sequentially -- swap to ascync
    for (let jobSpec of jobSpecs) {
        let jobId = (await parcel.submitJob(jobSpec)).id;
        // #endregion snippet-submit-job
        console.log(`Job ${jobId} submitted.`);

        // Wait for job completion.
        let job: Job;
        do {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
          job = await parcel.getJob(jobId);
          console.log(`Job status is ${JSON.stringify(job.status)}`);
        } while (job.status.phase === JobPhase.PENDING || job.status.phase === JobPhase.RUNNING);

        if (job.status.phase === JobPhase.SUCCEEDED) {
            console.log('Job completed successfully!');
        } else {
            console.log('Job failed!');
            console.log('Exiting with falure status code 1');
            return process.exit(1);
        }
        outputAddresses = outputAddresses.concat(job.status.outputDocuments.map((o) => {return o.id;}));
     }
     return outputAddresses;
}

async function merge(inputAddresses : string [], identity : IdentityId, parcel : Parcel) {
    // Split input into chunks
    let inputChunks : string [][] = [];
    for(let i = 0; i < inputAddresses.length; i+= maxInputFilesPerJob) {
        inputChunks.push(inputAddresses.slice(i,i+maxInputFilesPerJob));
    }
    let inputFileNamePrefix = "InputChunk";

    // Turn chunks into jobSpecs
    let jobSpecs : JobSpec [] = [];
    for(let inputChunk of inputChunks) {
        let inputDocuments : InputDocumentSpec[] = [];

        let cmd = [
            'csv_merger',
            '-o',
            '/parcel/data/out/output.txt',
        ]

        for(let i of inputChunk) {
            let fileName = `${inputFileNamePrefix}-${i}.txt`;
            let filePath = `/parcel/data/in/${fileName}`;
            inputDocuments.push({ mountPath: fileName, id: i as DocumentId});
            cmd.push('-i', filePath);
        }

        console.log(cmd.join(" "));

        // Submit the job.
        // #region snippet-submit-job
        const jobSpec: JobSpec = {
            name: 'csv-merger',
            image: 'humansimon/csv-merger',
            inputDocuments: inputDocuments,
            outputDocuments: [{ mountPath: 'output.txt', owner: identity }],
            cmd: cmd
        };
        jobSpecs.push(jobSpec);
    }

    return await submitJobSpecs(jobSpecs, parcel);
}

async function aggregate (inputAddresses : string [], identity : IdentityId, parcel : Parcel) {
    let inputFileNamePrefix = "InputChunk";
    let outputFileName = "summary.txt";

    let inputDocuments : InputDocumentSpec[] = [];
    let inputCmd : string[] = [];
    for(let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDocuments.push({ mountPath: fileName, id: inputAddresses[i] as DocumentId});
        inputCmd.push('-i', filePath);
    }

    let cmd = [
        'pydp-cli',
        '-c',
        'words',
        '-a',
        'mean',
        '-a',
        'sum',
        '-e',
        '5',
        '-o',
        `/parcel/data/out/${outputFileName}`,
    ].concat(inputCmd);

    console.log(cmd.join(" "));

    // Submit the job.
    // #region snippet-submit-job
    const jobSpec: JobSpec = {
        name: 'dp-shakespeare',
        image: 'humansimon/pydp-cli',
        inputDocuments: inputDocuments,
        outputDocuments: [{ mountPath: outputFileName, owner: identity }],
        cmd: cmd
    };

    return submitJobSpecs([jobSpec], parcel);
}

async function main() {
    console.log('Here we go...');

    const parcel = new Parcel({
      clientId: clientId,
      privateKey: privateKey
    });
    const identity =  (await parcel.getCurrentIdentity()).id;

    let inputAddresses = fs.readFileSync(args.inputAddresses || '', 'ascii').split("\n").filter(l => l !== '');
    
    // Parcel 0.1.9 errors with > 10 input addresses, so we run multiple rounds of merging.
    while(inputAddresses.length > maxInputFilesPerJob) {
        inputAddresses = await merge(inputAddresses, identity, parcel);
    }

    const outputAddresses = await aggregate(inputAddresses, identity, parcel);
    // Write the out addresses to the output file if set
    if(args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses, outputAddresses.join("\n"));
    }
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });;
