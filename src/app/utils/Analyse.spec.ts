import {Analyse} from "./Analyse";
import {IPcs} from "../core/IPcs";

describe('Analyse chords list', () => {

  it("0 2 4 5 7 8 11", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const triadChords = Analyse.getList3Chords(ipcsDiatMaj)

    expect(triadChords.get('I')![1].chordName).toEqual('CMajAug')

  })

  it("getList3Chords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const triadChords = Analyse.getList3Chords(ipcsDiatMaj)

    expect(triadChords.size).toEqual(7)
    expect(triadChords.get('I')?.length).toEqual(1)
    expect(triadChords.get('VII')?.length).toEqual(1)
    expect(triadChords.get('II')![0].chordName).toEqual('Dmin')
    expect(triadChords.get('III')![0].chordName).toEqual('Emin')
    expect(triadChords.get('IV')![0].chordName).toEqual('FMaj')
  })


  it("getListSeventhChords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]",
      n: 12,
    })

    const seventhChords = Analyse.getListSevenChords(ipcsDiatMaj)

    expect(seventhChords.size).toEqual(7)
    expect(seventhChords.get('I')?.length).toEqual(2)
    expect(seventhChords.get('VII')?.length).toEqual(2)
  })

  it("getListSeventhChords other scale", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 8, 11]",
      n: 12,
    })

    const seventhChords = Analyse.getListSevenChords(ipcsDiatMaj)

    expect(seventhChords.size).toEqual(7)
    expect(seventhChords.get('I')?.length).toEqual(2)
    expect(seventhChords.get('III')?.length).toEqual(4)
    expect(seventhChords.get('VII')?.length).toEqual(2)
  })


})
