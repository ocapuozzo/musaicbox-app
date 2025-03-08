
Info/ angular.json (for github pages)

  "outputPath": {
     "base": "docs",
      "browser": ""
   },

A/ For update 2048scales.json
  A1. Command terminal in folder /analyse : python3 ./bs4-web-scraping-ianring.py  > 2048scales-tocut.text
  A.2 Cut last part at end of document (list of updated names)
  A.3 cp 2048scales-cut.text to /src/app/data/2048scales.json
  4.4 Run a unit test and then see if there are any problems with reading 2048scales.json.
