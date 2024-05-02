import {Scales2048Name} from "./Scales2048Name";
import scales2048 from '../data/2048scales.json';
import {IPcs} from "./IPcs";
import {IScaleName} from "./IScaleName";

describe('test getScaleName from 2048pcs.json', () => {

  it("Test name Major Triad", () => {
    // const scales2048 = new Scales2048Name()
    const pcsMajTriad = new IPcs({strPcs:"0,4,7"})
    expect(Scales2048Name.getScaleName(pcsMajTriad)).toEqual('Major Triad')
  })

  it("refactoring 2048Name struct file", () => {
    expect(scales2048.length).toEqual(2048)

    // change property sources[{ }] by sources[ string ]
    // for (let i = 0; i < scales2048.length; i++) {
    //   let scale = scales2048[i]
    //   let newSources : string[] = []
    //   for (let j = 0; j < scale.sources.length; j++) {
    //     newSources.push(scale.sources[j].source)
    //   }
    //   scale.sources = newSources
    // }

    // console.log(JSON.stringify(scales2048))

  })


})
