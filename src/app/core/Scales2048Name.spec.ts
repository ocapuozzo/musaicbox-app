import scales2048 from "../../../analyse/2048scales.json";
import {IScaleName} from "./IScaleName";
import {Scales2048Name} from "./Scales2048Name";
import {IPcs} from "./IPcs";

describe('test getScaleName from 2048pcs.json', () => {

  it("Test name Major Triad", () => {
    const scales2048 = new Scales2048Name()
    const pcsMajTriad = new IPcs({strPcs:"0,4,7"})
    expect(scales2048.getScaleName(pcsMajTriad).name).toEqual('Major Triad')
  })

})
