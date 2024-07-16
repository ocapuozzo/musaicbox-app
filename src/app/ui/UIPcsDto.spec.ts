import {UIPcsDto} from "./UIPcsDto";

describe('UIPcsDto', () => {
  it ('default values', () => {
    const pcsDto = new UIPcsDto()
    expect(pcsDto.width).toEqual(91)
  })


  it ('update musaic width V2', () => {
    let pcsDto = new UIPcsDto()

    expect(pcsDto.width).toEqual(91)

    pcsDto.width = 40

    const newUIPcsDto = new UIPcsDto({
      ...pcsDto
    })
    // console.log(newUIPcsDto.uiMusaic)
    // console.log(newUIPcsDto.indexFormDrawer)
    expect(newUIPcsDto.width).toEqual(40)
  })


})
