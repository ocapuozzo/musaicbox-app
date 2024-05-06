import materialColors from '../color/materialColors.json'
import {StringHash} from "../utils/StringHash";

const colorMotifs: Map<string, string> = new Map([
  ['M1','black'],
  ['M1,M5','purple'],
  ['M1,M7', 'green'],
  ['M1,M11', 'blue'],
  ['M1,CM5', 'yellow'],
  ['M1,CM11', 'green'],
  ['M1,M5,M7,M11', 'lime'],
  ['M1,M5,CM1,CM5', 'amber'],
  ['M1,M5,CM7,CM11', 'orange'],
  ['M1,M7,CM5,CM11', 'pink'],
  ['M1,M11,CM1,CM11', 'lightgreen'],
  ['M1,M11,CM5,CM7', 'bluegrey'],
  ['M1,M5,M7,M11,CM1,CM5,CM7,CM11', 'lightblue']
  ])


export class PcsColor {
  static indexMaterialColors = ['red', 'pink', 'purple', 'deeppurple', 'indigo', 'blue', 'lightblue', 'cyan', 'teal',
  'green', 'lightgreen', 'lime', 'yellow', 'amber', 'orange', 'deeporange', 'brown', 'grey', 'bluegrey']

  static getColor(key: any) : string {
    if (colorMotifs.has(key)) {
      // console.log('color motif for ' + key + ' = ' + colorMotifs.get(key))
      if (key == 'M1') {
        return colorMotifs.get(key)! // black
      }
      return materialColors[colorMotifs.get(key)!][900]
    }
    if (!Number.isInteger(key)) {
      key = StringHash.stringHashCode(key.toString())
    }
    let index = (key*31) % PcsColor.indexMaterialColors.length
    return materialColors[PcsColor.indexMaterialColors[index]][800]
  }

}
