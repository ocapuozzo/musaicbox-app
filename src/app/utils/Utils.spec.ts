import {Utils} from "./Utils";

describe('Utils', () => {
  it("Generator hashCode from ABC", () => {
    let hashCode = Utils.stringHashCode('ABC')
    expect(hashCode).toEqual(64578)
    expect(hashCode).not.toEqual(Utils.stringHashCode('ABc'))
    expect(hashCode).not.toEqual(Utils.stringHashCode('ABC '))
  })

  it("hashCode on empty string", () => {
    let hashCode = Utils.stringHashCode('')
    expect(hashCode).toEqual(0)
  })

})
