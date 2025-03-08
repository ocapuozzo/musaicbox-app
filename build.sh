#!/bin/bash
date_heure=$(date +"%Y-%m-%d %H:%M")
sed -i "s/buildVersion:.*/buildVersion:\"$date_heure\"/" ./src/environments/environment.ts
sed -i "s/buildVersion:.*/buildVersion:\"$date_heure\"/" ./src/environments/environment.development.ts
ng build
echo "cp ./docs/index.html ./docs/404.html"
cp ./docs/index.html ./docs/404.html
echo "cp -r ./analyse/documentation/. ./docs"
cp -r ./analyse/documentation/. ./docs

