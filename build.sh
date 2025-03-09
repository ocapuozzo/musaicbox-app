#!/bin/bash
date_heure=$(date +"%Y-%m-%d %H:%M")
sed -i "s/buildVersion:.*/buildVersion:\"$date_heure\"/" ./src/environments/environment.ts
sed -i "s/buildVersion:.*/buildVersion:\"$date_heure\"/" ./src/environments/environment.development.ts
ng build
echo "cp ./docs/index.html ./docs/404.html"
cp ./docs/index.html ./docs/404.html

# cd analyse/documentation || exit
# asciidoctor ./Musaicbox.adoc
# cd ../..

echo "cp -r ./analyse/documentation/. ./docs"
# doc can be consulted via About link (with CTRL key pressed)
# must be generated before
cp -r ./analyse/documentation/. ./docs

