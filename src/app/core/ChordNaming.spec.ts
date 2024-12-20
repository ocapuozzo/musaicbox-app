import {IPcs} from "./IPcs";

describe('ChordNaming unit tests', () => {

  it("chordName mapped diat maj => 12", () => {
    const ipcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord
      n: 7,
      nMapping: 12,
      templateMappingBinPcs: [0, 2, 4, 5, 7, 9, 11]  // mapped in {C E G}
    })

    // console.log(ipcsDiatMajMapped.getMappedPcsStr())
    expect(ipcsDiatMajMapped.getChordName()).toEqual('CMaj')

    let pcs = ipcsDiatMajMapped.toggleIndexPC(6)
    expect(pcs.getChordName()).toEqual('CM7')

    pcs = new IPcs({strPcs: '{0,3,7}'})
    expect(pcs.getChordName()).toEqual('Cm')

    pcs = new IPcs({strPcs: '[11,2,5]' /*, iPivot:11*/})
    expect(pcs.getChordName()).toEqual('Bdim')

  })

})
