import * as Parcel from '@oasislabs/parcel-sdk';

// #region snippet-config
const configParams = Parcel.Config.paramsFromEnv();
const config = new Parcel.Config(configParams);
// #endregion snippet-config

async function main() {
    console.log('Here we go...');

    const identity = await config.getTokenIdentity();
    const dispatcher = await Parcel.Dispatcher.connect(config.dispatcherAddress, identity, config);

    //TODO:
    // Take as a command line argument either a file containing a list of
    // addresses or a single address.
    // Take an optional command line argument to write a list of ouput addresses.

    const inputAddress = ""

    // TODO: Create a for loop building a set of Job Requests

    // Submit the job.
    // #region snippet-submit-job
    const jobRequest = {
        name: 'extractor-shakespeare',
        dockerImage: 'humansimon/csv-extractor',
        inputDatasets: [{ mountPath: 'Paragraphs.txt.chunk1', address: new Parcel.Address(inputAddress)},],
        outputDatasets: outputDatasets,
        //echo "words,index" > /data/ouput.csv ; csvcut -c PlainText data/paragraphs-0.csv | tail -n+2 | wc -w  | sed 's/$/,1/' >> /data/ouput.csv
        cmd: [
            "echo",
            "\"words,index\"",
            ">",
            "/data/ouput.csv",
            ";",
            "csvcut",
            "-c",
            "PlainText",
            "data/paragraphs-0.csv",
            "|",
            "tail",
            "-n+2",
            "|",
            "wc",
            "-w",
            "|",
            "sed",
            "'s/$/,1/'",
            ">>",
            "/data/ouput.csv",
        ],
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
    }

    //An example reading output addresses
}

main();
