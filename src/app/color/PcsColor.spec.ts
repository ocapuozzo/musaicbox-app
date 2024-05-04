import {PcsColor} from "./PcsColor";

describe('PcsColor unit tests', () => {
  it('get orbit color', () => {
    const color = PcsColor.getColor('M1')
    expect(color).toEqual('black')
    // (42 * 31) % 19 = 10, offset 800
    expect(PcsColor.getColor(42)).toEqual('#558b2f')
  })
})
