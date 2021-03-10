# Bash script to upload Open Source Shakespeare to parcel.
# Credit www.opensourceshakespeare.org George Mason University.

# Usage: source scripts/upload-oss.sh

# Download and unzip the delimimeted text files of OSS
wget https://www.opensourceshakespeare.org/downloads/oss-textdb.zip
unzip oss-textdb.zip

#Upload
npm run-script run -- --sourcePath oss-textdb/Chapters.txt --title "OSS Chapters"
npm run-script run -- --sourcePath oss-textdb/Characters.txt --title "OSS Characters"
npm run-script run -- --sourcePath oss-textdb/Paragraphs.txt --title "OSS Paragraphs"
npm run-script run -- --sourcePath oss-textdb/WordForms.txt --title "OSS WordForms"
npm run-script run -- --sourcePath oss-textdb/Works.txt --title "OSS Works"