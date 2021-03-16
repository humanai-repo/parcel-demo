import * as Parcel from '@oasislabs/parcel-sdk';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as rd from 'readline';
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

    // #region snippit-read-input-addresses
    let reader = rd.createInterface(fs.createReadStream(args.inputAddresses));
    //TODO: filter blank lines
    const inputAddresses = fs.readFileSync(args.inputAddresses, 'ascii').split("\n").filter(l => l !== '');
    // #endregion snippit-read-input-addresses

    // #region snippet-create-job-requests
    let jobRequests = inputAddresses.map(
        (i) => {
            console.log(i);
            return {
                name: 'transform-shakespeare',
                //dockerImage: 'patagonagmbh/csvkit:1.0.3',
                dockerImage: 'humansimon/simple-transform',
                inputDatasets: [{ mountPath: 'input.csv', address: new Parcel.Address(i)},],
                outputDatasets: [{ mountPath: 'output.csv', owner: identity }],
                //echo "words,index" > /data/ouput.csv ; csvcut -c PlainText data/paragraphs-0.csv | tail -n+2 | wc -w  | sed 's/$/,1/' >> /data/ouput.csv
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
    // #endregion snippet-create-job-requests

    // Submit the jobs.
    
    let outputAddresses: string[] = [];
    // TODO: This submits each job sequentially -- swap to ascync
    for (let jobRequest of jobRequests) {
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
        outputAddresses = outputAddresses.concat(job.outputs.map((o) => {return o.address.hex;}));
     }
    //An example reading output addresses

    // Write the out addresses to the output file if set
    if(args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses, outputAddresses.join("\n"));
    }
}

main();
