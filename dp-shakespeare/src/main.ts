import * as Parcel from '@oasislabs/parcel-sdk';
import fs from 'fs';

// #region snippet-config
const configParams = Parcel.Config.paramsFromEnv();
const config = new Parcel.Config(configParams);
// #endregion snippet-config

async function main() {
    console.log('Here we go...');

    const identity = await config.getTokenIdentity();
    const dispatcher = await Parcel.Dispatcher.connect(config.dispatcherAddress, identity, config);

    // read the DataSet address from the SHAKESPEARE_ADDRESS env variable
    // TODO: Throw error if not set
    // TODO: Move to a command line argument
    const shakespeareAddress = process.env.SHAKESPEARE_ADDRESS;

    // Submit the job.
    // #region snippet-submit-job
    const jobRequest = {
        name: 'dp-shakespeare',
        dockerImage: 'humansimon/pydp-cli',
        inputDatasets: [{ mountPath: 'shakespeare_wc.csv', address: new Parcel.Address(shakespeareAddress) }],
        outputDatasets: [{ mountPath: 'shakespeare_summary.txt', owner: identity }],
        cmd: [
            'pydp-cli',
            '-i',
            '/parcel/data/in/shakespeare_wc.csv',
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
        ],
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
    }
}

main();
