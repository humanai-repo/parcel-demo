echo "INITIALISING"
# Save this as a home dir
HOME_DIR=`pwd`
# Create a working data dir
mkdir working-data
WORKING_DIR=$HOME_DIR/working-data
# Paths for intemediate data
PER_ENTITY_INPUT_ADDRESSES=$WORKING_DIR/per-entity-input-addresses.txt
PER_ENTITY_OUTPUT_ADDRESSES=$WORKING_DIR/per-entity-output-addresses.txt
OUTPUT_ADDRESS=$WORKING_DIR/ouput_address.txt
OUPUT=$WORKING_DIR/output.txt
# Read the command lines
INPUT_ADDRESSES=$1
N_ENTITIES=$2

echo "EXTRACTOR"
# Run the extractor
cd $HOME_DIR/../extractor-shakespeare
npm run-script run -- -a $INPUT_ADDRESSES -n $N_ENTITIES -o $PER_ENTITY_INPUT_ADDRESSES
STATUS=$?

#If it errored then bail
if test $status -neq 0
then
	exit 1
fi

echo "TRANSFORM"
# Run the transform
cd $HOME_DIR/../transform-shakespeare 
npm run-script run -- -a $PER_ENTITY_INPUT_ADDRESSES -o $PER_ENTITY_OUTPUT_ADDRESSES
STATUS=$?

#If it errored then bail
if test $status -neq 0
then
	exit 1
fi

echo "AGGREGATE"
# Run the aggregator
cd $HOME_DIR/../dp-shakespeare
npm run-script run -- -a $PER_ENTITY_INPUT_ADDRESSES -o $OUTPUT_ADDRESS
STATUS=$?
if test $status -neq 0
then
	exit 1
fi

echo "DOWNLOAD OUTPUT"
# Download the output
parcel get --datasetAddress `cat $OUTPUT_ADDRESS` --targetPath $OUPUT