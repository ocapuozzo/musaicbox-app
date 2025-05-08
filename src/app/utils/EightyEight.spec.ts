import {IPcs} from "../core/IPcs";
import {EightyEight} from "./EightyEight";

describe('88 musaics utility', () => {

  it("ID number of first musaic (empty) and last (whole tone) pcs", () => {

    const emptyPcs = new IPcs({strPcs:'', n:12})
    const wholeTonePcs = new IPcs({strPcs:'[0,2,4,6,8,10]', n:12})

    expect(EightyEight.idMusaicOf(emptyPcs)).toEqual("M1-0-1-2-2")
    expect(EightyEight.idMusaicOf(wholeTonePcs)).toEqual("M88-6-26-1-2")
  })


  it("index of musaic", () => {

    const emptyPcs = new IPcs({strPcs:'', n:12})
    const wholeTonePcs = new IPcs({strPcs:'[0,2,4,6,8,10]', n:12})
    const diatonic = new IPcs({strPcs:'[0,2,4,5,7,9,11]', n:12})

    expect(EightyEight.indexOfMusaic(EightyEight.idMusaicOf(emptyPcs))).toEqual(1)
    expect(EightyEight.indexOfMusaic(EightyEight.idMusaicOf(wholeTonePcs))).toEqual(88)
    expect(EightyEight.indexOfMusaic(EightyEight.idMusaicOf(diatonic))).toEqual(38)

  })

})
