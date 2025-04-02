import {AnalyseChord} from "./AnalyseChord";
import {IPcs} from "../core/IPcs";

describe('AnalyseChord chords list', () => {

  it("0 2 4 5 7 8 11", () => {
    const pcsDiatonicMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const triadChords = AnalyseChord.getList3Chords(pcsDiatonicMaj)

    expect(triadChords.get('I')![1].getChordName()).toContain('Caug')
    expect(triadChords.get('I')![0].getChordName()).toEqual('CMaj')

  })

  it("getList3Chords diat maj not mapped", () => {
    const pcsDiatonicMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const triadChords = AnalyseChord.getList3Chords(pcsDiatonicMaj)

    expect(triadChords.size).toEqual(7)
    expect(triadChords.get('I')?.length).toEqual(4)
    expect(triadChords.get('VII')?.length).toEqual(2) // Bdim, Bm b6 and Em/5th (B is fifth of Em)
    expect(triadChords.get('III')![0].getChordName()).toEqual('Em')
    expect(triadChords.get('IV')![0].getChordName()).toEqual('FMaj')
  })


  it("getList4Chords diat maj not mapped", () => {
    const pcsDiatonicMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const fourChords = AnalyseChord.getList4Chords(pcsDiatonicMaj)

    expect(fourChords.size).toEqual(7)
    expect(fourChords.get('I')?.length).toEqual(4)
       // CMaj, C6, CMaj9 no 7th and CM7 sus4 (no IV bass 5 because pure inversion)

    expect(fourChords.get('VII')?.length).toEqual(3)
      // Bdim, Bm7 add 11 and Bm7 #5 (no CM7/7th, because it is pure inversion)
  })

  it("getList4Chords other scale", () => {
    const pcsDiatonicMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const fourChords = AnalyseChord.getList4Chords(pcsDiatonicMaj)

    expect(fourChords.size).toEqual(7)
    expect(fourChords.get('I')?.length).toEqual(5)
    expect(fourChords.get('III')?.length).toEqual(6)
    expect(fourChords.get('VII')?.length).toEqual(1) // Bdim7  (no CM7/7th because inversion is not true)
  })


})
