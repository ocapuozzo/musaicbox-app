import {StringHash} from "./StringHash";

describe('Utils', () => {
  it("Generator hashCode from ABC", () => {
    let hashCode = StringHash.stringHashCode('ABC')
    expect(hashCode).toEqual(64578)
    expect(hashCode).not.toEqual(StringHash.stringHashCode('ABc'))
    expect(hashCode).not.toEqual(StringHash.stringHashCode('ABC '))
  })

  it("hashCode on empty string", () => {
    let hashCode = StringHash.stringHashCode('')
    expect(hashCode).toEqual(0)
  })

})
