import {IPcs} from "../core/IPcs";

export class Analyse {

  static ROMAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

  static getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
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
                strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 7) % n)})
            Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
          // flattened fifth (if near fifth)
          if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 6) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 6) % n)})
            Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
          // augmented fifth (if near fifth)
          // if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 8) % n] == 1) {
          //   const pcs =
          //     new IPcs({strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 8) % n)})
          //   Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          // }

        }
        // major
        if (binPcs[(i + 4) % n] == 1) {
          // fifth
          if (binPcs[(i + 7) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 7) % n)})
            this.addPcs(thirdChordByDegree, nbDegree, pcs);
          }
          // diminished (flattened) fifth (if near fifth)
          // if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 6) % n] == 1) {
          //   const pcs =
          //     new IPcs({strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 6) % n)})
          //   this.addPcs(thirdChordByDegree, nbDegree, pcs);
          // }

          // augmented fifth (if near fifth)
          if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 8) % n] == 1) {
            const pcs =
              new IPcs({
                strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 8) % n)})
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
            if (binPcs[(i + 10) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 7) % n) + ',' + ((i + 10) % n)
                })
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
            if (binPcs[(i + 11) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 7) % n) + ',' + ((i + 11) % n)
                })
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
          }
          // flattened fifth (if near fifth)
          if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 6) % n] == 1) {
            if (binPcs[(i + 10) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 6) % n) + ',' + ((i + 10) % n)
                })
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
            if (binPcs[(i + 11) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 6) % n) + ',' + ((i + 11) % n)})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
          }
          // augmented fifth (if near fifth)
          // if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 8) % n] == 1) {
          //   const pcs =
          //     new IPcs({strPcs: '' + (i % n) + ',' + ((i + 3) % n) + ',' + ((i + 8) % n)})
          //   Analyse.addPcs(thirdChordByDegree, nbDegree, pcs);
          // }

        }
        // major
        if (binPcs[(i + 4) % n] == 1) {
          // fifth
          if (binPcs[(i + 7) % n] == 1) {
            if (binPcs[(i + 10) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 7) % n) + ',' + ((i + 10) % n)})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
            if (binPcs[(i + 11) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 7) % n) + ',' + ((i + 11) % n)})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
          }
          // diminished (flattened) fifth (if near fifth)
          // if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 6) % n] == 1) {
          //   const pcs =
          //     new IPcs({strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 6) % n)})
          //   this.addPcs(thirdChordByDegree, nbDegree, pcs);
          // }
          // augmented fifth (if near fifth)
          if (binPcs[(i + 7) % n] == 0 && binPcs[(i + 8) % n] == 1) {
            if (binPcs[(i + 10) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 8) % n) + ',' + ((i + 10) % n)})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
            if (binPcs[(i + 11) % n] == 1) {
              const pcs =
                new IPcs({
                  strPcs: '' + (i % n) + ',' + ((i + 4) % n) + ',' + ((i + 8) % n) + ',' + ((i + 11) % n)})
              Analyse.addPcs(sevenChordByDegree, nbDegree, pcs);
            }
          }
        }
      }
    }
    return sevenChordByDegree
  }


  static _getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
    const thirdChordByDegree = new Map<string, IPcs[]>()

    let pcsTranslate = pcs
    thirdChordByDegree.set(Analyse.ROMAIN[0], [pcsTranslate])
    for (let i = 0; i < pcs.n; i++) {
      pcsTranslate = pcsTranslate.translation(1)
      thirdChordByDegree.set(Analyse.ROMAIN[i], [pcsTranslate])
    }

    return thirdChordByDegree
  }


  /**
   * Nice implementation, but we don't get alternative chords (by example when minor and minor are together possible)
   * @param pcs
   */
  static __getList3Chords(pcs: IPcs): Map<string, IPcs[]> {
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
}
