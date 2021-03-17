import * as Parcel from '@oasislabs/parcel-sdk';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';

// #region snippet-config
const configParams = Parcel.Config.paramsFromEnv();
const config = new Parcel.Config(configParams);

interface IOArguments {
    // TODO: Make input addresses optional and allow a single input address
    // to be passed instead of a path to a file of addresses
    inputAddresses: string;
    outputAddresses?: string;
    count: number;
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

    const identity = await config.getTokenIdentity();
    const dispatcher = await Parcel.Dispatcher.connect(config.dispatcherAddress, identity, config);

    const inputAddresses = fs.readFileSync(args.inputAddresses, 'ascii').split("\n").filter(l => l !== '');
    const shakespeareNPlays = args.count;

    const outputFileNamePrefix = "ExtratedParagraphs";
    const inputFileNamePrefix = "InputChunk";

    var inputDatasets = [];
    var inputCmd : string[] = [];
    for(let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDatasets.push({ mountPath: fileName, address: new Parcel.Address(inputAddresses[i])});
        inputCmd.push('-i', filePath);
    }

    var outputDatasets = []
    for (let i = 0; i < shakespeareNPlays; i++) {
        outputDatasets.push({ mountPath: `${outputFileNamePrefix}-${i}.csv`, owner: identity })
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

    // Submit the job.
    // #region snippet-submit-job
    const jobRequest = {
        name: 'extractor-shakespeare',
        dockerImage: 'humansimon/csv-extractor',
        inputDatasets: inputDatasets,
        outputDatasets: outputDatasets,
        cmd: cmd,
    };

    const jobId = await dispatcher.submitJob({ job: jobRequest });
    // #endregion snippet-submit-job
    console.log(`Job ${Parcel.utils.encodeHex(jobId)} submitted.`);

    // Wait for job completion.
    const job = await dispatcher.getCompletedJobInfo(jobId);
    if (job.status instanceof Parcel.JobCompletionStatus.Success) {
        console.log('Job completed successfully!');
    } else {
        console.log('Job failed!', job.info);
        console.log('Exiting with falure status code 1');
        return process.exit(1);
    }
    const outputAddresses = job.outputs.map((o) => {return o.address.hex;});
    // Write the out addresses to the output file if set
    if(args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses, outputAddresses.join("\n"));
    }
}

main();
