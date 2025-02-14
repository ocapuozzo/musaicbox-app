#!/bin/bash
ng build
echo "cp ./docs/index.html ./docs/404.html"
cp ./docs/index.html ./docs/404.html
echo "cp -r ./analyse/documentation/. ./docs"
cp -r ./analyse/documentation/. ./docs

