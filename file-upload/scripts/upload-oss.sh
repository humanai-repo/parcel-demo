# Bash script to upload Open Source Shakespeare to parcel.
# Credit www.opensourceshakespeare.org George Mason University.

# Usage: source scripts/upload-oss.sh

# Download and unzip the delimimeted text files of OSS
wget https://www.opensourceshakespeare.org/downloads/oss-textdb.zip
mkdir oss-textdb
unzip -d oss-textdb oss-textdb.zip

#TODO: Parcel appears to have a default 10Meg file size limit. Follow up on how
# to upload larger files however in the meantime chunk down.
head -n 80000 oss-textdb/Paragraphs.txt > oss-textdb/Paragraphs.txt.chunk1
tail -n +80001 oss-textdb/Paragraphs.txt > oss-textdb/Paragraphs.txt.chunk2

#Upload
parcel upload --fromPath oss-textdb/Chapters.txt --datasetTitle "OSS Chapters"
parcel upload --fromPath oss-textdb/Characters.txt --datasetTitle "OSS Characters"
parcel upload --fromPath oss-textdb/Paragraphs.txt.chunk1 --datasetTitle "OSS Paragraphs chunk1"
parcel upload --fromPath oss-textdb/Paragraphs.txt.chunk2 --datasetTitle "OSS Paragraphs chunk2"
parcel upload --fromPath oss-textdb/WordForms.txt --datasetTitle "OSS WordForms"
parcel upload --fromPath oss-textdb/Works.txt --datasetTitle "OSS Works"