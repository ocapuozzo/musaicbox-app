import {IPcs} from "../core/IPcs";
import {HistoryT} from "./HistoryT";

describe('HistoryT test', () => {

  it("3 do, 3 undo", () => {
     const h = new HistoryT<IPcs>()
     const maj = new IPcs({strPcs:"1,5,8"})
     h.pushIntoPresent(maj)
     h.pushIntoPresent(maj.translation(1))
     const pcsPF = maj.cyclicPrimeForm()
     h.pushIntoPresent(pcsPF)

     expect(h.unDoToPresent()?.id).toEqual(maj.translation(1).id)
     expect(h.reDoToPresent()?.id).toEqual(pcsPF.id)
     expect(h.unDoToPresent()?.id).toEqual(maj.translation(1).id)
     let pcs : IPcs | undefined
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
    const h = new HistoryT<IPcs>()
    const maj = new IPcs({strPcs: "1,5,8"})

    expect(h.getCurrent()).not.toBeTruthy()
    h.pushIntoPresent(maj)
    expect(h.getCurrent()).toEqual(maj)
  })

  it("History with array", () => {
    const h = new HistoryT<IPcs[]>()
    const maj = new IPcs({strPcs: "1,5,8"})
    const min = new IPcs({strPcs: "0,3,7"})
    h.pushIntoPresent([maj, min])

    expect(h.getCurrent()![0].getPcsStr()).not.toEqual('[0,3,7]')
    expect(h.getCurrent()![0].getPcsStr()).toEqual('[1,5,8]')

    // no go to past
    expect(h.canUndo()).toBe(false)
    // no come back to the future
    expect(h.canRedo()).toBe(false)

    h.pushIntoPresent([min])

    // can go to past
    expect(h.canUndo()).toBe(true)
    // no come back to the future
    expect(h.canRedo()).toBe(false)

    h.unDoToPresent()

    // no more go to past
    expect(h.canUndo()).toBe(false)
    // can come back to the future
    expect(h.canRedo()).toBe(true)

    h.reDoToPresent()

    // can go to past
    expect(h.canUndo()).toBe(true)
    // no come back to the future
    expect(h.canRedo()).toBe(false)

  })

 })
