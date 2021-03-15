import * as Parcel from '@oasislabs/parcel-sdk';

// #region snippet-config
const configParams = Parcel.Config.paramsFromEnv();
const config = new Parcel.Config(configParams);
// #endregion snippet-config

async function main() {
    console.log('Here we go...');

    const identity = await config.getTokenIdentity();
    const dispatcher = await Parcel.Dispatcher.connect(config.dispatcherAddress, identity, config);

    // read the OSS Paragraphs chunks address from the
    // SHAKESPEARE_PARA1_ADDRESS and SHAKESPEARE_PARA2_ADDRESS env variables.
    // Read the number of plays from the SHAKESPEARE_N_PLAYS env variable.
    // TODO: Refactor such that the number of input chunks is not hardcoded.
    // TODO: Move the environment variables to commandline args.
    const shakespeareParaAddress1 = process.env.SHAKESPEARE_PARA1_ADDRESS;
    const shakespeareParaAddress2 = process.env.SHAKESPEARE_PARA2_ADDRESS;
    const shakespeareNPlays = parseInt(process.env.SHAKESPEARE_N_PLAYS);

    const fileNamePrefix = "ExtratedParagraphs"

    var outputDatasets = []
    for (var i = 0; i < shakespeareNPlays; i++) {
        outputDatasets.push({ mountPath: `${fileNamePrefix}-${i}.csv`, owner: identity })
    }


    // Submit the job.
    // #region snippet-submit-job
    const jobRequest = {
        name: 'extractor-shakespeare',
        dockerImage: 'humansimon/csv-extractor',
        inputDatasets: [{ mountPath: 'Paragraphs.txt.chunk1', address: new Parcel.Address(shakespeareParaAddress1)},
                        { mountPath: 'Paragraphs.txt.chunk2', address: new Parcel.Address(shakespeareParaAddress2)}],
        outputDatasets: outputDatasets,
        cmd: [
            'csv_extractor',
            '-i',
            '/parcel/data/in/Paragraphs.txt.chunk1',
            '-i',
            '/parcel/data/in/Paragraphs.txt.chunk2',
            '-c',
            'PlainText',
            '--id',
            'WorkID',
            '-n',
            `${shakespeareNPlays}`,
            '-p',
            `/parcel/data/out/${fileNamePrefix}`,
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

    // TODO: Write a file to output with a list of output addresses.
}

main();
