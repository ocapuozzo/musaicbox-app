import {AnalyseChord} from "./AnalyseChord";
import {IPcs} from "../core/IPcs";

describe('AnalyseChord chords list', () => {

  it("0 2 4 5 7 8 11", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const triadChords = AnalyseChord.getList3Chords(ipcsDiatMaj)

    expect(triadChords.get('I')![1].getChordName()).toEqual('Caug')
    expect(triadChords.get('I')![0].getChordName()).toEqual('CMaj')

  })

  it("getList3Chords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const triadChords = AnalyseChord.getList3Chords(ipcsDiatMaj)

    expect(triadChords.size).toEqual(7)
    expect(triadChords.get('I')?.length).toEqual(2)
    expect(triadChords.get('VII')?.length).toEqual(2)
    expect(triadChords.get('II')![0].getChordName()).toEqual('Dm')
    expect(triadChords.get('III')![0].getChordName()).toEqual('Em')
    expect(triadChords.get('IV')![0].getChordName()).toEqual('FMaj')
  })


  it("getList4Chords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const fourChords = AnalyseChord.getList4Chords(ipcsDiatMaj)

    expect(fourChords.size).toEqual(7)
    expect(fourChords.get('I')?.length).toEqual(3) // 2 plus IV bass I
    expect(fourChords.get('VII')?.length).toEqual(2)
  })

  it("getList4Chords other scale", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const fourChords = AnalyseChord.getList4Chords(ipcsDiatMaj)

    expect(fourChords.size).toEqual(7)
    expect(fourChords.get('I')?.length).toEqual(3)
    expect(fourChords.get('III')?.length).toEqual(6)
    expect(fourChords.get('VII')?.length).toEqual(1)
  })


})
