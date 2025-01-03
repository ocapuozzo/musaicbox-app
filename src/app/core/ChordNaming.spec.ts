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

  it('Inversion chords', () => {
    const cm = new IPcs({
      strPcs: "[7, 0, 3]", // maj 3-chord bass 5th
    })
    expect(cm.getChordName()).toEqual('Cm/5th')

    const fm = new IPcs({
      strPcs: "[0, 5, 8]", // maj 3-chord
    })
    expect(fm.getChordName()).toEqual('Fm/5th')

    const fM = new IPcs({
      strPcs: "[0, 5, 9]", // maj 3-chord
    })
    expect(fM.getChordName()).toEqual('FMaj/5th')

  })

})
