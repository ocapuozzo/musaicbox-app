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

     expect(h.unDoToPresent(pcsOther)?.id).toEqual(pcsPF.id)
     expect(h.reDoToPresent()?.id).toEqual(pcsOther.id)
     expect(h.unDoToPresent(pcsOther)?.id).toEqual(pcsPF.id)
     let pcs = h.unDoToPresent(pcsPF)
     pcs = h.unDoToPresent(pcs!)
     expect(pcs?.id).toEqual(maj.id)
     pcs = h.unDoToPresent(pcs!)
     expect(pcs).not.toBeTruthy() // undefined

     h.pushInPast(pcsPF)
     // console.log(h.history.length) // 1
     // console.log(h.currentIndexPast) // 0
  })

 })
