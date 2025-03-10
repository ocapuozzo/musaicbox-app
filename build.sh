#!/bin/bash
date_time=$(date +"%Y-%m-%d--%H-%M")
version=$(cat package.json | jq -r '.version')
sed -i "s/buildVersion:.*/buildVersion:\"$version--$date_time\"/" ./src/environments/environment.ts
sed -i "s/buildVersion:.*/buildVersion:\"$version--$date_time\"/" ./src/environments/environment.development.ts
echo "(files ./src/environments/environment*) buildVersion updated with : $version-$date_time"

ng build
echo "cp ./docs/index.html ./docs/404.html"
cp ./docs/index.html ./docs/404.html

## generate documentation
# cd analyse/documentation || exit
# asciidoctor ./Musaicbox.adoc
# cd ../..

echo "cp -r ./analyse/documentation/. ./docs"
# doc can be consulted via About link (with CTRL key pressed, while waiting for the analysis to be more advanced.)
cp -r ./analyse/documentation/. ./docs

