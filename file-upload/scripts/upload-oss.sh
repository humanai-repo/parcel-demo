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
npm run-script run -- --sourcePath oss-textdb/Chapters.txt --title "OSS Chapters"
npm run-script run -- --sourcePath oss-textdb/Characters.txt --title "OSS Characters"
npm run-script run -- --sourcePath oss-textdb/Paragraphs.txt.chunk1 --title "OSS Paragraphs chunk1"
npm run-script run -- --sourcePath oss-textdb/Paragraphs.txt.chunk2 --title "OSS Paragraphs chunk2"
npm run-script run -- --sourcePath oss-textdb/WordForms.txt --title "OSS WordForms"
npm run-script run -- --sourcePath oss-textdb/Works.txt --title "OSS Works"