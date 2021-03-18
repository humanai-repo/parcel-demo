import Parcel, {InputDocumentSpec, OutputDocumentSpec, Job, JobSpec, JobPhase, DocumentId} from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

// #region snippet-config
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

async function main() {
    console.log('Here we go...');

    const parcel = new Parcel({
      clientId: clientId,
      privateKey: privateKey
    });
    const identity =  (await parcel.getCurrentIdentity()).id;

    const inputAddresses = fs.readFileSync(args.inputAddresses || '', 'ascii').split("\n").filter(l => l !== '');
    
    const inputFileNamePrefix = "InputChunk";

    var inputDocuments : InputDocumentSpec[] = [];
    var inputCmd : string[] = [];
    for(let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDocuments.push({ mountPath: fileName, id: inputAddresses[i] as DocumentId});
        inputCmd.push('-i', filePath);
    }

    var cmd = [
        'pydp-cli',
        '-c',
        'words',
        '-a',
        'mean',
        '-a',
        'sum',
        '-e',
        '50', // TODO: Set too high for testing
        '-o',
        '/parcel/data/out/shakespeare_summary.txt',
    ].concat(inputCmd);

    console.log(cmd.join(" "));

    // Submit the job.
    // #region snippet-submit-job
    const jobSpec: JobSpec = {
        name: 'dp-shakespeare',
        image: 'humansimon/pydp-cli',
        inputDocuments: inputDocuments,
        outputDocuments: [{ mountPath: 'shakespeare_summary.txt', owner: identity }],
        cmd: cmd
    };

    // TODO: Add a debug mode that pipes STDERR and STDOUT to mounted files
    // (this is NOT secure but would be appropriate with data you have raw
    // access to).

    const jobId = (await parcel.submitJob(jobSpec)).id;
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
    const outputAddresses = job.status.outputDocuments.map((o) => {return o.id;});
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
