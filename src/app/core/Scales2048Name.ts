import scales2048 from '../data/2048scales.json';
import {IPcs} from "./IPcs";
import {IScaleName} from "./IScaleName";

export class Scales2048Name {
  // https://github.com/json-world/how-to-read-local-json-file-in-angular-application

  static getScale2048Name(pcs: IPcs): IScaleName {
    const isOfPcs = pcs.is().toString()
    return scales2048.find((row: IScaleName) => row.is == isOfPcs)
  }

  // TODO comment
  static getScaleName(pcs: IPcs): string {
    let cardinal = pcs.cardOrbitMode()
    let scaleName :IScaleName
    for (let i = 0; i < cardinal ; i++) {
      scaleName = Scales2048Name.getScale2048Name(pcs)
      if (scaleName.name && i==0) return scaleName.name
      if (scaleName.name) return `degree ${i+1} of ${scaleName.name}`
      pcs = pcs.modulation(IPcs.PREV_DEGREE)
    }
    return ''
  }


  //  @see
  //  https://en.wikipedia.org/wiki/Alexander_Tcherepnin
  //  https://en.wikipedia.org/wiki/List_of_musical_scales_and_modes
  //  https://fretboardknowledge.com/guitar/kb/allan-holdsworths-10-most-usable-scales/
  //  ...

}
