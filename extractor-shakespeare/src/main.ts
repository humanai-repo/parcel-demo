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
    count?: number;
    help?: boolean;
}

export const args = parse<IOArguments>(
    {
        inputAddresses: {type: String, alias: 'a', optional: true,
            description: 'Path to a list of input addresses, one address per line.'},
        outputAddresses: {type: String, alias: 'o', optional: true,
            description: 'Optional path to write a list of output addresses, one address per line.'},
        count: {type: Number, alias: 'n', optional: true,
            description: 'The number of unique entities expected.'},
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
    console.log('Retrieving identity');
    const identity =  (await parcel.getCurrentIdentity()).id;


    const inputAddresses = fs.readFileSync(args.inputAddresses || '', 'ascii').split("\n").filter(l => l !== '');
    const shakespeareNPlays = args.count || 0;

    const outputFileNamePrefix = "ExtratedParagraphs";
    const inputFileNamePrefix = "InputChunk";

    console.log('Building inputs and output paths');
    
    var inputDocuments : InputDocumentSpec[] = [];
    var inputCmd : string[] = [];
    for(let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDocuments.push({ mountPath: fileName, id: inputAddresses[i] as DocumentId});
        inputCmd.push('-i', filePath);
    }

    var outputDocuments : OutputDocumentSpec[] = []
    for (let i = 0; i < shakespeareNPlays; i++) {
        outputDocuments.push({ mountPath: `${outputFileNamePrefix}-${i}.csv`, owner: identity })
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

    console.log(cmd.join(" "));

    // Submit the job.
    // #region snippet-submit-job
    const jobSpec: JobSpec = {
        name: 'extractor-shakespeare',
        image: 'humansimon/csv-extractor',
        inputDocuments: inputDocuments,
        outputDocuments: outputDocuments,
        cmd: cmd,
    };

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
    });
