import * as Parcel from '@oasislabs/parcel-sdk';
import fs from 'fs';
import { parse } from 'ts-command-line-args';
import * as process from 'process';

// #region snippet-config
const configParams = Parcel.Config.paramsFromEnv();
const config = new Parcel.Config(configParams);

interface IOArguments {
    // TODO: Make input addresses optional and allow a single input address
    // to be passed instead of a path to a file of addresses
    inputAddresses: string;
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

    const identity = await config.getTokenIdentity();
    const dispatcher = await Parcel.Dispatcher.connect(config.dispatcherAddress, identity, config);

    const inputAddresses = fs.readFileSync(args.inputAddresses, 'ascii').split("\n").filter(l => l !== '');
    
    const inputFileNamePrefix = "InputChunk";

    var inputDatasets = [];
    var inputCmd : string[] = [];
    for(let i in inputAddresses) {
        let fileName = `${inputFileNamePrefix}-${i}.txt`;
        let filePath = `/parcel/data/in/${fileName}`;
        inputDatasets.push({ mountPath: fileName, address: new Parcel.Address(inputAddresses[i])});
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
        '5',
        '-o',
        '/parcel/data/out/shakespeare_summary.txt',
    ].concat(inputCmd);

    // Submit the job.
    // #region snippet-submit-job
    const jobRequest = {
        name: 'dp-shakespeare',
        dockerImage: 'humansimon/pydp-cli',
        inputDatasets: inputDatasets,
        outputDatasets: [{ mountPath: 'shakespeare_summary.txt', owner: identity }],
        cmd: cmd
    };

    // TODO: Add a debug mode that pipes STDERR and STDOUT to mounted files
    // (this is NOT secure but would be appropriate with data you have raw
    // access to).

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
