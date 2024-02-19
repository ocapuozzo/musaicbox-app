import {IPcs} from "./IPcs";

const chordName : Map<string, string> = new Map<string, string>()
chordName.set('[0,3,7]', 'Minor triad')
chordName.set('[0,4,7]', 'Major triad')
chordName.set('[0,3,6]', 'Diminished triad')
chordName.set('[0,4,4]', 'Augmented triad')

export class ChordName {

  /**
   * Get chord name from cyclic primeform of mapped representation
   * @param pcs
   * @return {string} chord name
   */
  static getChordName(pcs : IPcs) : string {
    return chordName.get(
      new IPcs({binPcs:pcs.getMappedBinPcs()})
        .cyclicPrimeForm()
        .getMappedPcsStr()) ?? ''
  }
}
