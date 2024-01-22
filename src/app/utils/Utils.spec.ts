import {Utils} from "./Utils";

describe('Utils', () => {
  it("Generator hashCode from ABC", () => {
    let hashCode = Utils.stringHashCode('ABC')
    expect(hashCode).toEqual(64578)
    expect(hashCode).not.toEqual(Utils.stringHashCode('ABc'))
    expect(hashCode).not.toEqual(Utils.stringHashCode('ABC '))
  })

})
