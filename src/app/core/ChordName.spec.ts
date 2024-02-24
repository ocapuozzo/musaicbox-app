import {IPcs} from "./IPcs";

describe('IPcs unit tests', () => {

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
    expect(pcs.getChordName()).toEqual('CMaj7')

    pcs = new IPcs({strPcs: '{0,3,7}'})
    // console.log(pcs.cyclicPrimeForm().getMappedPcsStr())
    expect(pcs.getChordName()).toEqual('Cmin')

    pcs = new IPcs({strPcs: '[11,2,5]' /*, iPivot:11*/})
    expect(pcs.getChordName()).toEqual('Bmin ♭5')

  })

})
