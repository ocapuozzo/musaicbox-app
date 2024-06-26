import {HistoryPcs} from "./HistoryPcs";
import {IPcs} from "../core/IPcs";

describe('History', () => {

  it("3 do, 3 undo", () => {
     const h = new HistoryPcs()
     const maj = new IPcs({strPcs:"1,5,8"})
     h.pushInPast(maj)
     h.pushInPast(maj.translation(1))
     const pcsPF = maj.cyclicPrimeForm()
     h.pushInPast(pcsPF)
     const pcsOther = maj.affineOp(7,1)

     expect(h.unDoToPresent()?.id).toEqual(maj.translation(1).id)
     expect(h.reDoToPresent()?.id).toEqual(pcsPF.id)
     expect(h.unDoToPresent()?.id).toEqual(maj.translation(1).id)
     let pcs = h.unDoToPresent()
     pcs = h.unDoToPresent()
     expect(pcs?.id).toEqual(maj.id)

     pcs = h.unDoToPresent()
     expect(pcs?.id).toEqual(maj.id)
      // stay on first !!
     pcs = h.unDoToPresent()
     expect(pcs?.id).toEqual(maj.id)

     pcs = h.reDoToPresent()
     expect(pcs?.id).toEqual(maj.translation(1).id)

  })


  it("getCurrentPcs", () => {
    const h = new HistoryPcs()
    const maj = new IPcs({strPcs: "1,5,8"})

    expect(h.getCurrentPcs()).not.toBeTruthy()
    h.pushInPast(maj)
    expect(h.getCurrentPcs()).toEqual(maj)
  })

 })
