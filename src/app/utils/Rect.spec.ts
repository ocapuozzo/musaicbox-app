import {Rect} from "./Rect";

describe('Rect', () => {
  it("Contains", () => {
    let p = new Rect(10,10, 100, 100)
    expect(p.contains(5, 5)).toEqual(true)
  })

})
