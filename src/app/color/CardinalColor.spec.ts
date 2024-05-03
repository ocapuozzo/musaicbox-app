import {CardinalColor} from "./CardinalColor";

describe('CardinalColor unit tests', () => {
  it('get cardinal color', () => {
    const color = CardinalColor.getColor(12)
    expect(color).toEqual('#fff9c4')
    expect(CardinalColor.getColor(6)).toEqual('#b3e5fc')
  })
})
