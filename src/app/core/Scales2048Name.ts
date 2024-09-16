import scales2048 from '../data/2048scales.json';
import {IPcs} from "./IPcs";
import {INameDefLink, IScaleName} from "./IScaleName";

/**
 * scales2048 is imported (see import)
 * see https://github.com/json-world/how-to-read-local-json-file-in-angular-application
 */
export class Scales2048Name {

  static ROOT_NAMES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B']

  static getScale2048Name(pcs: IPcs): IScaleName {
    const isOfPcs = pcs.is().toString()
    return scales2048.find((row: IScaleName) => row.is == isOfPcs)
  }

  static getDefaultFreeText(pcs: IPcs) : string {
    pcs = pcs.unMap()
    const pcsNames = Scales2048Name.getLinksNameDefs(pcs).map(value => value.name).join("\n")
    const infoRoot = pcs.iPivot ? ` (root = ${Scales2048Name.ROOT_NAMES[pcs.iPivot]}) \n` : ""
    let infoChord = pcs.getChordName()
    if (infoChord) infoChord += "\n"

    return infoChord + infoRoot + pcsNames
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

  static getLinksNameDefs(pcs : IPcs) : INameDefLink[] {
    let res: INameDefLink[] = []
    const links = Scales2048Name.getScale2048Name(pcs)?.sources ?? res
    for (let i = 0; i < links.length ; i++) {
      if (links[i].name) {
        res.push({url: links[i].url, name: links[i].name, type: links[i].type})
      }
    }
    return res
  }


  //  @see
  //  https://en.wikipedia.org/wiki/Alexander_Tcherepnin
  //  https://en.wikipedia.org/wiki/List_of_musical_scales_and_modes
  //  https://fretboardknowledge.com/guitar/kb/allan-holdsworths-10-most-usable-scales/
  //  ...

}
