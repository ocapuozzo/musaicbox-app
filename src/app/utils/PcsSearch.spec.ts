import {PcsSearch} from "./PcsSearch";
import {IPcs} from "../core/IPcs";


describe('PcsSearch test', () => {

  it("searchPcsWithThisIV 4 pcs with same IV", () => {
    const pcsSameIV =  PcsSearch.searchPcsWithThisIV("4,3,4,4,4,2")
    expect(pcsSameIV.length).toEqual(4)

    expect(PcsSearch.searchPcsWithThisIV("2,3,3,2,4,1").length).toEqual(4)

    const pcs = new IPcs({strPcs:"0,1,2,4,6,7"})
    expect(PcsSearch.searchPcsWithThisIV(pcs.iv().toString()).length).toEqual(4)

  })

  it("searchPcsWithThisIV 3 pcs with same IV", () => {
    expect(PcsSearch.searchPcsWithThisIV("4,4,4,3,4,2").length).toEqual(3)
  })

  it("searchPcsWithThisIV pcs same IV of MajorDiato", () => {
    const pcsDiatoMaj = new IPcs({strPcs:"0,2,4,5,7,9,11"}).modalPrimeForm()
    const pcsSameIV = PcsSearch.searchPcsWithThisIV(pcsDiatoMaj.iv().toString())
    expect(pcsSameIV.length).toEqual(1)
    expect(pcsSameIV[0].modalPrimeForm().id).toEqual(pcsDiatoMaj.id)
  })

})
