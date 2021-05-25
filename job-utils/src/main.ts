import Parcel, { InputDocumentSpec, OutputDocumentSpec, Job, JobId, JobSpec, JobPhase, DocumentId, IdentityId } from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '');

interface IOArguments {
    jobIds?: string;
    outputAddresses?: string;
    help?: boolean;
}

export const args = parse<IOArguments>(
    {
        jobIds: {
            type: String, alias: 'j', optional: true,
            description: 'Path to a csv of input addresses, one address & filename per line.'
        },
        outputAddresses: {
            type: String, alias: 'o', optional: true,
            description: 'Optional path to write a list of output addresses, one address per line.'
        },
        help: {
            type: Boolean, optional: true, alias: 'h',
            description: 'Prints this usage guide'
        },
    },
    {
        helpArg: 'help',
    },
);

async function monitorJobs(jobIds: JobId[], parcel: Parcel) {
    // Wait for them to complete
    let jobRunningOrPending: boolean;
    let jobs : Job [];
    do {
        jobRunningOrPending = false;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
        jobs = [];
        console.log('Getting job statuses');
        for(let jobId of jobIds) {
            let job = await parcel.getJob(jobId);
            if(job.status === null || job.status === undefined) {
                console.log(`Error reading ${jobId}`);
                jobRunningOrPending = true;
            }
            else {
                console.log(`Job ${jobId} status is ${JSON.stringify(job.status.phase)}`);
                console.log(`    with message ${JSON.stringify(job.status.message)}`);
                jobs.push(job);
            }
        }
        for(let job of jobs) {
            if(job.status !== undefined) {
                let jobId = job.id;
                jobRunningOrPending = jobRunningOrPending || job.status.phase === JobPhase.PENDING ||
                    job.status.phase === JobPhase.RUNNING;
                if(job.status.phase === JobPhase.FAILED) {
                    console.log(`Job ${jobId} failed with msg ${job.status.message}`);
                    throw Error(`Job ${jobId} failed with msg ${job.status.message}`);
                }
            }
        }
    } while(jobRunningOrPending);

    // When all jobs have completed collect the output addresses
    let outputAddresses : DocumentId [] = [];
    for(let job of jobs) {
        if(job.status !== undefined) {
            for(let outputDoc of job.status.outputDocuments) {
                outputAddresses.push(outputDoc.id);
            }
        }
    }
    return outputAddresses;
}

async function main() {
    console.log('Here we go...');

    const parcel = new Parcel({
        clientId: clientId,
        privateKey: privateKey
    });

    const jobIds =
        fs.readFileSync(args.jobIds || '', 'ascii').
        split("\n").
        filter( (l:string) => l !== '').
        map((l:string) => l as JobId);

    const outputAddresses = await monitorJobs(jobIds, parcel);
    // Write the out addresses to the output file if set
    if (args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses || '', outputAddresses.join("\n"));
    }
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });;
