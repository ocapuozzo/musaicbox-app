import materialColors from '../color/materialColors.json'

export class CardinalColor {
  static indexColor = ['red', 'pink', 'purple', 'deeppurple', 'indigo', 'blue', 'lightblue', 'cyan', 'teal',
  'green', 'lightgreen', 'lime', 'yellow', 'amber', 'orange', 'deeporange', 'brown', 'grey', 'bluegrey']

  static getColor(cardinal : number) : string {
     // cardinal * 2 for better contraste
      return materialColors[CardinalColor.indexColor[(cardinal * 2) % CardinalColor.indexColor.length]][700]
  }
}
