import {PcsColor} from "./PcsColor";

describe('PcsColor unit tests', () => {
  it('get orbit color', () => {
    const color = PcsColor.getColor('M1')
    expect(color).toEqual('black')

    expect(PcsColor.getColor(42)).toEqual('#7cb342')
    // (42 * 31) % 19 = 10 => lightgreen offset 600

    expect(PcsColor.getColor("42")).toEqual('#ffb300')
    // key = 13 => amber offset 600

  })
})
