
import {Point} from "./Point";

describe('Point', () => {
  it("Point x + y", () => {
    let p = new Point(10,10)
    expect(p.x+p.y).toEqual(20)
  })

})
