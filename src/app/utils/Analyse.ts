import {IPcs} from "../core/IPcs";

export class Analyse {

  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  static __getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
    const thirdChordByDegree = new Map<string, IPcs[]>()
    const binPcs = pcs.getMappedBinPcs()
    const n: number = binPcs.length
    const pivot = pcs.iPivot ?? 0

    let nbDegree = 0
    for (let i = pivot; i < binPcs.length + pivot; i++) {
      if (binPcs[(i % n)] == 1) {
        nbDegree++
        // minor
        if (binPcs[(i + 3) % n] == 1) {
          // fifth
          if (binPcs[(i + 7) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 7) % n)
              })
            Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
          // flattened fifth (if near fifth)
          if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 6) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 6) % n)
              })
            Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
        }
        // major
        if (binPcs[(i + 4) % n] == 1) {
          // fifth
          if (binPcs[(i + 7) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 7) % n)
              })
            this.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
          // augmented fifth (if near fifth)
          if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 8) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 8) % n)
              })
            Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
        }
      }
    }
    return thirdChordByDegree
  }

  static getListSevenChords(pcs: IPcs): Map<string, IPcs[]> {
    const sevenChordByDegree = new Map<string, IPcs[]>()
    const binPcs = pcs.getMappedBinPcs()
    const n: number = binPcs.length // or nMapping
    const pivot = pcs.templateMappingBinPcs[pcs.iPivot ?? 0]
    let nbDegree = 0
    for (let i = pivot; i < n + pivot; i++) {
      if (binPcs[(i % n)] == 1) {
        let binChord = new Array(n)
        binChord[0] = 1
        nbDegree++
        if (binPcs[(i + 3) % n] == 1) {
          binChord[3] = 1
          Analyse.create4Chords(sevenChordByDegree, nbDegree, i, binPcs, binChord.slice())
        }
        binChord[3] = 0
        if (binPcs[(i + 4) % n] == 1) {
          binChord[4] = 1
          Analyse.create4Chords(sevenChordByDegree, nbDegree, i, binPcs, binChord.slice())
        }
        // no third ?
        binChord[4] = 0
        if (binPcs[(i + 3) % n] == 0 && binPcs[(i + 4) % n] == 0) {
          // 11 7b ?
          if (binPcs[(i + 5) % n] == 1 && binPcs[(i + 10) % n] == 1) {
            binChord[5] = 1
            binChord[10] = 1
            const pcs = new IPcs({binPcs: binChord})
            Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
          }
        }
      }
    }
    return sevenChordByDegree
  }

  /**
   * Nice implementation, but we don't get alternative chords (by example when minor and minor are together possible)
   * @param pcs
   */
  static getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
    const thirdChordByDegree = new Map<string, IPcs[]>()

    console.log(pcs.n + '==' + pcs.nMapping)

    let pcsTranslate = (pcs.n == pcs.nMapping) ? pcs.autoMap() : pcs
    const template3chord = new IPcs({
      n: pcsTranslate.n,
      strPcs: '0,2,4',
      nMapping: pcsTranslate.nMapping,
      templateMappingBinPcs: pcsTranslate.templateMappingBinPcs,
      orbit: pcsTranslate.orbit
    })

    let pcs3chord = template3chord // pcsTranslate.cyclicPrimeForm()!.orbit!.groupAction!.getIPcsInOrbit(template3chord)
    const n = pcs3chord.n
    thirdChordByDegree.set(Analyse.ROMAIN[0], [pcs3chord])
    for (let i = 1; i < n; i++) {
      pcs3chord = pcs3chord.translation(1)
      console.log("pcs3chord = " + pcs3chord.toString())
      thirdChordByDegree.set(Analyse.ROMAIN[i], [pcs3chord])
    }

    return thirdChordByDegree
  }

  static addPcs(thirdChordByDegree: Map<string, IPcs[]>, i: number, pcs: IPcs) {
    const key = Analyse.ROMAIN[i - 1]
    if (!thirdChordByDegree.has(key)) {
      thirdChordByDegree.set(key, [pcs])
    } else {
      thirdChordByDegree.get(key)?.push(pcs)
    }
  }

  /**
   *
   * @param sevenChordByDegree
   * @param nbDegree
   * @param i
   * @param binPcs
   * @param binChord
   * @private
   */
  private static create4Chords(
    sevenChordByDegree: Map<string, IPcs[]>,
    nbDegree: number,
    i: number,
    binPcs: number[],
    binChord: number[]): void {

    let n = binPcs.length
    let pivot = i % n

    // fifth ?
    if (binPcs[(i + 7) % n] == 1) {
      binChord[7] = 1
      // minor seventh ?
      if (binPcs[(i + 10) % n] == 1) {
        binChord[10] = 1
        // strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 6) % n)
        const pcs =
          new IPcs({binPcs: binChord})
        Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
      }
      // major seventh ?
      if (binPcs[(i + 11) % n] == 1) {
        binChord[10] = 0
        binChord[11] = 1
        const pcs = new IPcs({binPcs: binChord})
        Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
      }
    }
    {
      binChord[7] = 0
      // try with no perfect fifth
      // flattened fifth (if near fifth)
      if (binPcs[(i + 8) % n] == 1 || binPcs[(i + 6) % n] == 1) {
        // diminished fifth ?
        if (binPcs[(i + 6) % n] == 1) {
          binChord[8] = 0
          binChord[6] = 1
          //minor seventh
          if (binPcs[(i + 10) % n] == 1) {
            binChord[10] = 1
            const pcs =
              new IPcs({binPcs: binChord})
            Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
          }
          // major seventh ?
          if (binPcs[(i + 11) % n] == 1) {
            binChord[10] = 0
            binChord[11] = 1
            const pcs = new IPcs({binPcs: binChord})
            Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
          }
          // minor sixte ?
          if (binPcs[(i + 8) % n] == 1) {
            binChord[10] = 0
            binChord[11] = 0
            binChord[8] = 1
            const pcs = new IPcs({binPcs: binChord})
            Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
          }
          // major sixte ?
          if (binPcs[(i + 9) % n] == 1) {
            binChord[10] = 0
            binChord[11] = 0
            binChord[8] = 0
            binChord[9] = 1
            const pcs = new IPcs({binPcs: binChord})
            Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
          }
        } else { // augmented fifth if not diminished fifth ?
          if (binPcs[(i + 8) % n] == 1) {
            binChord[8] = 1
            // minor seventh ?
            if (binPcs[(i + 10) % n] == 1) {
              binChord[10] = 1
              const pcs =
                new IPcs({binPcs: binChord})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
            }
            // major seventh ?
            if (binPcs[(i + 11) % n] == 1) {
              binChord[10] = 0
              binChord[11] = 1
              const pcs = new IPcs({binPcs: binChord})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
            }
          }
        }
      } else { // when no seventh, is sixte ?
        if (binPcs[(i + 9) % n] == 1) {
          binChord[9] = 1
          const pcs = new IPcs({binPcs: binChord})
          Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
        } // minor sixte
        if (binPcs[(i + 8) % n] == 1) {
          binChord[9] = 0
          binChord[8] = 1
          const pcs = new IPcs({binPcs: binChord})
          Analyse.addPcs(sevenChordByDegree, nbDegree, pcs.translation(pivot));
        }
      }
    }
  }
}
