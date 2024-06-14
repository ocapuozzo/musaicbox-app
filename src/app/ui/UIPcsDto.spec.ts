import {UIPcsDto} from "./UIPcsDto";

describe('UIPcsDto', () => {
  it ('default values', () => {
    const pcsDto = new UIPcsDto()
    expect(pcsDto.uiMusaic.width).toEqual(100)
  })

  it ('update musaic width', () => {
    const pcsDto = new UIPcsDto()
    expect(pcsDto.uiMusaic.width).toEqual(100)
    pcsDto.uiMusaic.width=40
    // const newMusaicWidth = {uiMusaic:{width:40}}
    const newUIPcsDto = new UIPcsDto({
      ...pcsDto
      // ...newMusaicWidth
    })
    expect(newUIPcsDto.uiMusaic.width).toEqual(40)
  })

  it ('update musaic width V2', () => {
    const pcsDto = new UIPcsDto()

    expect(pcsDto.uiMusaic.width).toEqual(100)

    pcsDto.uiMusaic.width=40
    // const newMusaicWidth = {uiMusaic:{width:40}}
    const newUIPcsDto = new UIPcsDto({
      ...pcsDto
      // ...newMusaicWidth
    })
    // console.log(newUIPcsDto.uiMusaic)
    expect(newUIPcsDto.uiMusaic.width).toEqual(40)
  })


})
