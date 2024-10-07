import {IPcs} from "../core/IPcs";
import {EightyEight} from "./EightyEight";

describe('88 musaics utility', () => {

  it("ID number of forst (empty) and last (whole tone) pcsList", () => {

    const emptyPcs = new IPcs({strPcs:'', n:12})
    const wholeTonePcs = new IPcs({strPcs:'[0,2,4,6,8,10]', n:12})

    expect(EightyEight.idNumberOf(emptyPcs)).toEqual(1)
    expect(EightyEight.idNumberOf(wholeTonePcs)).toEqual(88)
  })

})
