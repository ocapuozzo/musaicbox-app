import {Analyse} from "./Analyse";
import {IPcs} from "../core/IPcs";

describe('Analyse chords list', () => {

  it("0 2 4 5 7 8 11", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const triadChords = Analyse.getList3Chords(ipcsDiatMaj)

    expect(triadChords.get('I')![0].getChordName()).toEqual('Caug')
    expect(triadChords.get('I')![1].getChordName()).toEqual('CMaj')

  })

  it("getList3Chords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const triadChords = Analyse.getList3Chords(ipcsDiatMaj)

    expect(triadChords.size).toEqual(7)
    expect(triadChords.get('I')?.length).toEqual(2)
    expect(triadChords.get('VII')?.length).toEqual(1)
    expect(triadChords.get('II')![0].getChordName()).toEqual('Dmin')
    expect(triadChords.get('III')![0].getChordName()).toEqual('Emin')
    expect(triadChords.get('IV')![0].getChordName()).toEqual('FMaj')
  })


  it("getList4Chords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const fourChords = Analyse.getList4Chords(ipcsDiatMaj)

    expect(fourChords.size).toEqual(7)
    expect(fourChords.get('I')?.length).toEqual(2)
    expect(fourChords.get('VII')?.length).toEqual(1)
  })

  it("getList4Chords other scale", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const fourChords = Analyse.getList4Chords(ipcsDiatMaj)

    expect(fourChords.size).toEqual(7)
    expect(fourChords.get('I')?.length).toEqual(2)
    expect(fourChords.get('III')?.length).toEqual(3)
    expect(fourChords.get('VII')?.length).toEqual(1)
  })


})
