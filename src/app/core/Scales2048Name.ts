import scales2048 from './2048scales.json';
import {IPcs} from "./IPcs";
import {IScaleName} from "./IScaleName";

export class Scales2048Name {
  // https://github.com/json-world/how-to-read-local-json-file-in-angular-application

  getScaleName(pcs: IPcs): IScaleName {
    const isOfPcs = pcs.is().toString()
    return scales2048.find((row: IScaleName) => row.is == isOfPcs)
  }
}
