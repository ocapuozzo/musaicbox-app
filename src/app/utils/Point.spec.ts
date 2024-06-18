
import {Point} from "./Point";

describe('Point', () => {
  it("Point x + y", () => {
    let p = new Point(10,10)
    expect(p.x+p.y).toEqual(20)
  })

  it("isInclude", () => {
    let p = new Point(10,10)
    const rect = new DOMRect(11,11, 100,100)
    expect(p.isIncludeIn(rect)).not.toBeTruthy()

    const rect2 = new DOMRect(10,10, 100,100)
    expect(p.isIncludeIn(rect2)).toBeTruthy()

    p = new Point(88,88)
    const rect3 = new DOMRect(-10,-10, 100,100)
    expect(p.isIncludeIn(rect3)).toBeTruthy()
  })

})
