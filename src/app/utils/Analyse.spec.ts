import {Analyse} from "./Analyse";
import {IPcs} from "../core/IPcs";

describe('Analyse', () => {

  it("getList3Chords diat maj not mapped", () => {
    const ipcsDiatMaj = new IPcs({
      strPcs: "[0, 2, 4, 5, 7, 9, 11]", // first 3-chord
      n: 12,
    })

    const triadChords = Analyse.getList3Chords(ipcsDiatMaj)

    expect(triadChords.size).toEqual(7)
    expect(triadChords.get('I')?.length).toEqual(1)
    expect(triadChords.get('VII')?.length).toEqual(2)
  })

})
