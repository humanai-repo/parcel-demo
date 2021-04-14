import Parcel, { InputDocumentSpec, OutputDocumentSpec, Job, JobSpec, JobPhase, DocumentId, IdentityId } from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

const researcherClientId = process.env.RESEARCHER_PARCEL_CLIENT_ID ?? '';
const researcherPrivateKey = JSON.parse(process.env.RESEARCHER_OASIS_API_PRIVATE_KEY ?? '');


const dataOwnerClientId = process.env.DATA_OWNER_PARCEL_CLIENT_ID ?? '';
const dataOwnerPrivateKey = JSON.parse(process.env.DATA_OWNER_OASIS_API_PRIVATE_KEY ?? '');

// As of Parcel 0.1.9, there is an effective restriction on the number of input files.
// To work around this just run the job multiple times only mounting batches of 10 output
// files for each run.
const maxInputFilesPerJob = 10;

interface IOArguments {
    // TODO: Make input addresses optional and allow a single input address
    // to be passed instead of a path to a file of addresses
    inputPath?: string;
    outputPath?: string;
    title?: string;
    count?: number;
    help?: boolean;
}

export const args = parse<IOArguments>(
    {
        inputPath: {
            type: String, alias: 'i', optional: true,
            description: 'Path to an input file.'
        },
        title: {
            type: String, alias: 't', optional: true,
            description: 'Title for file.'
        },
        outputPath: {
            type: String, alias: 'o', optional: true,
            description: 'Path to a directory to write output files.'
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
    // Submit the Jobs
    let jobIds = jobSpecs.map((jobSpec) => {
        console.log(jobSpec.cmd.join(" "));
        let jobId = (await parcel.submitJob(jobSpec)).id;
        console.log(`Job ${jobId} submitted.`);
        return jobId;
    });
    
    // Wait for them to complete
    let jobRunningOrPending: boolean;
    let jobs : Job [];
    do {
        jobRunningOrPending = false;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
        jobs = Job [];
        for(let jobId of jobIds) {
            let job = await parcel.getJob(jobId);
            jobs.push(job);
        }

        for(let job of jobs) {
            console.log(`Job ${jobId} status is ${JSON.stringify(job.status)}`);
            jobRunningOrPending = jobRunningOrPending || job.status.phase === JobPhase.PENDING ||
                job.status.phase === JobPhase.RUNNING;
            if(job.status.phase === JobPhase.FAILED) {
                console.log(`Job ${jobId} failed with msg ${job.message}`);
                throw Error(`Job ${jobId} failed with msg ${job.message}`);
            }
        }
    } while(jobRunningOrPending);

    // When all jobs have completed collect the output addresses
    let outputAddresses =
        ([] as string[]).concat(
            jobs.map((job) => {
                return job.status.outputDocuments.map((o) => { return o.id; });
            })
        );
    return outputAddresses;
}

async function extract(inputAddresses: string[], shakespeareNPlays: Number,
    identity: IdentityId, parcel: Parcel) {
    console.log('Extracting');
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

async function transform(inputAddresses: string[], identity: IdentityId,
    parcel: Parcel) {
    console.log('Transforming');
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

async function aggregate(inputAddresses: string[], identity: IdentityId,
    parcel: Parcel) {
    console.log('Aggregating inputs');
    let inputFileNamePrefix = "InputChunk";
    let outputFileName = "summary.txt";

    let inputDocuments: InputDocumentSpec[] = [];
    let inputCmd: string[] = [];
    for (let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDocuments.push(
            { mountPath: fileName, id: inputAddresses[i] as DocumentId });
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

    const jobSpec: JobSpec = {
        name: 'dp-shakespeare',
        image: 'humansimon/pydp-cli',
        inputDocuments: inputDocuments,
        outputDocuments: [{ mountPath: outputFileName, owner: identity }],
        cmd: cmd
    };

    return submitJobSpecs([jobSpec], parcel);
}

async function upload(title: string, path: string, parcel: Parcel) {
    const documentDetails = { title: title };

    console.log('Uploading data for our user');
    let doc: Document;

    try {
        doc = await parcel.uploadDocument(
            await fs.promises.readFile(path),
            { details: documentDetails }).finished;
    } catch (error: any) {
        console.error('Failed to upload document');
        throw error;
    }
    console.log(
        `Created document ${doc.id} with title ${doc.details.title}`);
    return [doc.id];
}

async function download(inputAddresses: string[], path: string,
    parcel: Parcel) {
    for(let inputAddress of inputAddresses) {
        const download = parcel.downloadDocument(inputAddress as DocumentId);
        const saver = fs.createWriteStream(`${path}/${inputAddress}`);
        try {
          await download.pipeTo(saver);
          console.log(`Document ${inputAddress} has been downloaded to ${path}`);
        } catch (error: any) {
          console.error(`Failed to download document ${inputAddress}`);
          throw error;
        }
    }
}

async function setXAccessControls(parcel : Parcel) {
    // TODO
}

async function setFxAccessControls(parcel : Parcel) {
    // TODO
}

async function main() {
    console.log('Here we go...');

    const reseacherParcel = new Parcel({
        clientId: researcherClientId,
        privateKey: researcherPrivateKey
    });


    const dataOwnerParcel = new Parcel({
        clientId: dataOwnerClientId,
        privateKey: dataOwnerPrivateKey
    });

    const shakespeareNPlays = args.count || 0;
    const title = args.title || '';
    const inputPath = args.inputPath || '';
    const outputPath = args.outputPath || '';

    const dataOwnerIdentity = (await dataOwnerParcel.getCurrentIdentity()).id;
    const researcherIdentity = (await reseacherParcel.getCurrentIdentity()).id;

    const inputs = await upload(title, inputPath, dataOwnerParcel);

    // inputs are passed to the researcher
    const x = await extract(inputs, shakespeareNPlays, dataOwnerIdentity, reseacherParcel);
    // test -- Can the dataOwner read the input
    // Can an alternative image be run
    // Can an alternative owner be set on the output

    const xDo = await setXAccessControls(dataOwnerParcel);

    // test -- are xR and xDo the same?

    const fx = await transform(x, dataOwnerIdentity, reseacherParcel);

    // tests
    // can multiple files be set as input
    // can multiple files be set as output
    // can an alternative owner be set

    // there is currently no test that

    const fxDo = await setFxAccessControls(dataOwnerParcel);
    // test -- are fxDo and fx the same

    //TODO: MERGING -- Test with only 10 files initially.
    const outputs = await aggregate(fx, researcherIdentity, reseacherParcel);

    await download(outputs, outputPath, reseacherParcel);

    console.log('Retrieving identity');
}

main()
    .then(() => console.log('All done!'))
    .catch((err) => {
        console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
        return process.exit(1);
    });
