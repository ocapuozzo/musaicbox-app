import {Scales2048Name} from "./Scales2048Name";
import scales2048 from '../data/2048scales.json';
import {IPcs} from "./IPcs";
import {IScaleName} from "./IScaleName";
import {EightyEight} from "../utils/EightyEight";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";

describe('test getScaleName from 2048pcs.json', () => {

  it("Test name Major Triad", () => {
    // const scales2048 = new Scales2048Name()
    const pcsMajTriad = new IPcs({strPcs:"0,4,7"})
    expect(Scales2048Name.getScaleName(pcsMajTriad)).toEqual('Major Triad')
  })


  it('Skeleton for initiate list of 2048 modes/scales ', () => {
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    let nbModes = 0
    for (const orbit of groupCyclic.orbits) {
      nbModes += orbit.getPcsMin().cardOrbitMode()
    }
    expect(nbModes).toEqual(2048)

    // other algorithm
    // key : Intervallic Structure
    // value : array of string (IPcs)
    const isDict = new Map<string, string>()
    let dic = []
    // from 4096 to 2048
    for (let pcs of groupCyclic.powerset.values()) {
      if (pcs.is().toString())
        if (!isDict.has(pcs.is().toString())) {
          isDict.set(pcs.is().toString(), pcs.getPcsStr())
        }
    }

    expect(isDict.size).toEqual(2048) // +1 for empty pcsList

    // from 4096 no cyclic equiv : 24318 (some says 24576 but is not because Limited Transposition)
    // expect(allDict.size).toEqual(24318)

    let array =
      Array.from(isDict, ([name, value]) => ({
        is: name,
        name: '',
        pcs: value,
        id88:  EightyEight.idNumberOf(new IPcs({strPcs:value})),
        sources: [""]
      }));

    expect(array[42].id88).toEqual(28)

    expect(array.length).toEqual(2048)
    // console.log(JSON.stringify(array))
    // console.log(JSON.stringify(array.length))
  })


  it("find id88 2048Name", () => {
    expect(scales2048.length).toEqual(2048)

    // Example of update from existing data (set id88 value)
    // for (let i = 0; i < scales2048.length; i++) {
    //   const pcs = new IPcs({strPcs:scales2048[i].pcs})
    //   scales2048[i].id88 = EightyEight.idNumberOf(pcs)
    // }

    const pcs = scales2048.find( (s : IScaleName) => s.is=="2,2,1,2,2,2,1")
    expect(pcs.id88).toEqual(38)
  })


})
