import scales2048 from '../data/2048scales.json';
import {IPcs} from "./IPcs";
import {INameDefLink, IScaleName} from "./IScaleName";

export class Scales2048Name {
  // https://github.com/json-world/how-to-read-local-json-file-in-angular-application

  static getScale2048Name(pcs: IPcs): IScaleName {
    const isOfPcs = pcs.is().toString()
    return scales2048.find((row: IScaleName) => row.is == isOfPcs)
  }


  /**
   * Get first scale name or degree of close one
   * @param pcs
   * @return {IScaleName} containing name infos, may be to contain empty value
   */
  static getFirstScaleNameOrDerived(pcs: IPcs): INameDefLink  {
    let cardinalMode = pcs.cardOrbitMode()
    for (let i = 0; i < cardinalMode ; i++) {
      let nameDefLink = Scales2048Name.getScale2048Name(pcs).sources[0]
      let scaleName = nameDefLink.name
      if (scaleName && i==0) return Scales2048Name.getScale2048Name(pcs).sources[0]
      if (scaleName) return {
        name :  `degree ${i+1} of ${scaleName}`,
        url : nameDefLink.url,
        type: nameDefLink.type
      }
      pcs = pcs.modulation(IPcs.PREV_DEGREE)
    }
    return {
      name: '',
      url: '',
      type: ''
    }
  }




  //  @see
  //  https://en.wikipedia.org/wiki/Alexander_Tcherepnin
  //  https://en.wikipedia.org/wiki/List_of_musical_scales_and_modes
  //  https://fretboardknowledge.com/guitar/kb/allan-holdsworths-10-most-usable-scales/
  //  ...

}
