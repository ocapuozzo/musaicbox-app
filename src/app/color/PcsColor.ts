import materialColors from '../color/materialColors.json'
import {StringHash} from "../utils/StringHash";

const colorMotifs: Map<string, string> = new Map([
  ['M1','black'],
  ['M1,M5', materialColors['purple'][900]],
  ['M1,M7', materialColors['green'][800]],
  ['M1,M11', materialColors['blue'][900]],
  ['M1,CM5', materialColors['yellow'][800]],
  ['M1,CM11', materialColors['green'][900]],
  ['M1,M5,M7,M11', materialColors['lime'][900]],
  ['M1,M5,CM1,CM5', materialColors['amber'][900]],
  ['M1,M5,CM7,CM11', materialColors['orange'][900]],
  ['M1,M7,CM5,CM11', materialColors['pink'][900]],
  ['M1,M11,CM1,CM11', materialColors['lightgreen'][700]],
  ['M1,M11,CM5,CM7', materialColors['bluegrey'][900]],
  ['M1,M5,M7,M11,CM1,CM5,CM7,CM11', materialColors['lightblue'][900]]
  ])


export class PcsColor {
  static indexMaterialColors = ['red', 'pink', 'purple', 'deeppurple', 'indigo', 'blue', 'lightblue', 'cyan', 'teal',
  'green', 'lightgreen', 'lime', 'yellow', 'amber', 'orange', 'deeporange', 'brown', 'grey', 'bluegrey']

  static getColor(key: any) : string {
    if (colorMotifs.has(key)) {
      // console.log('color motif for ' + key + ' = ' + colorMotifs.get(key))
      // if (key == 'M1') {
      //   return colorMotifs.get(key)! // black
      // }
      return colorMotifs.get(key)!
    }
    if (!Number.isInteger(key)) {
      key = StringHash.stringHashCode(key.toString())
    }
    let index = (key*31) % PcsColor.indexMaterialColors.length
    return materialColors[PcsColor.indexMaterialColors[index]][600]
  }

}