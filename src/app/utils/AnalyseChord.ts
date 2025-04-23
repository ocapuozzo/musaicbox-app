import {IPcs} from "../core/IPcs";
import {ChordNaming} from "../core/ChordNaming";

export type TRoman = typeof AnalyseChord.ROMAN[number];

export class AnalyseChord {

  static ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  static getListChords(pcs: IPcs, conf: {
    nPitches ?: number,
    includeInversion?: boolean,
    extended?: boolean }={}
  ): Map<TRoman, IPcs[]> {
    const includeInversion = conf.includeInversion ?? false
    const extendedChord = conf.extended ?? true
    const nOfPitches = conf.nPitches ?? 3

       // because each degree is processed separately
       // We don't want IV/5th to be added to the various chords of the 1st degree, for example.
    const chordsByDegree = new Map<TRoman, IPcs[]>()
    const cardinal = pcs.cardinal

    // unMap() if necessary, chords research work on n == 12
    let pcsWorking = pcs.n < 12 ? pcs.unMap() : pcs
    for (let nbDegree = 0; nbDegree < cardinal; nbDegree++) {
      let pidChords: number[]
      if (nOfPitches === 3) {
        pidChords = ChordNaming.getKeysChord(pcsWorking, {nPitches:3, includeInversion:includeInversion, extended:extendedChord})
      } else {
        pidChords = ChordNaming.getKeysChord(pcsWorking, {nPitches:4, includeInversion:includeInversion, extended:extendedChord})
      }
      if (pidChords.length === 0) {
        chordsByDegree.set(AnalyseChord.ROMAN[nbDegree], [])
      } else {
        for (let pid of pidChords) {

          // get pcs and replace to origin by translation +pivot
          let chord = new IPcs({
            pidVal: pid,
          }).transposition(pcsWorking.iPivot ?? 0)

          if (pcs.nMapping > pcs.n) {
            // pcs is Mapped, convert keyChordPcs from templateMapping
            // 0 4 7 with n=7, nMapping=12, templateMapping[0, 2, 4, 5, 7, 9, 11]
            // so "0 4 7" => unMappedPcs = "0 2 4" (and vector [1,0,1,0,1,0,0,0])

            const unMappedPcs =
                chord.getPcsStr(false).split(' ').map(pc => pcs.templateMapping.indexOf(Number(pc)))
            // if not compatible with mapping, pass
            if (unMappedPcs.includes(-1)) {
              continue
            }
            // chord version with mapping
            chord = new IPcs({
              strPcs: unMappedPcs.join(' '),
              iPivot: pcs.templateMapping.indexOf(chord.iPivot!),
              n: pcs.n,
              nMapping: pcs.nMapping,
              templateMapping: pcs.templateMapping
            })
          }

          AnalyseChord.addPcs(chordsByDegree, nbDegree + 1, chord)
        }

      }
      pcsWorking = pcsWorking.modulation("Next")
    }
    return chordsByDegree
  }

  static getList4Chords(pcs: IPcs, extendedChord: boolean = false): Map<string, IPcs[]> {
     return AnalyseChord.getListChords(pcs, {nPitches:4, extended:extendedChord})
  }

  static getList3Chords(pcs: IPcs, extendedChord: boolean = false): Map<string, IPcs[]> {
    return AnalyseChord.getListChords(pcs, {nPitches:3, extended:extendedChord})
  }

  static addPcs(chordsByDegree: Map<string, IPcs[]>, i: number, pcs: IPcs) {
    const key = AnalyseChord.ROMAN[i - 1]
    if (!chordsByDegree.has(key)) {
      chordsByDegree.set(key, [pcs])
    } else {
      chordsByDegree.get(key)?.push(pcs)
    }
  }

}
