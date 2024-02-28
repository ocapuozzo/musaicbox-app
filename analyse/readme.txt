
angular.json

Error:(19, 13) JSON standard does not allow comments. Use JSMin or similar tool to remove comments before parsing.


 // before : "outputPath": "docs/musaic-box-app",
 // https://github.com/angular/angular-cli/issues/26304

  "outputPath": {
     "base": "docs",
      "browser": ""
   },

for githubpages, command is :
ng build  --base-href /musaicbox-app/
