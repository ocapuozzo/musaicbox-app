import {Scales2048Name} from "./Scales2048Name";
import scales2048 from '../data/2048scales.json';
import {IPcs} from "./IPcs";
// import {INameDefLink, IScaleName, IScaleNameNew} from "./IScaleName";
import {EightyEight} from "../utils/EightyEight";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";
import {IScaleName} from "./IScaleName";
// import {Ianring} from "../data/ianringScaleNames";

describe('test getFirstScaleName from 2048pcs.json', () => {

  it("Test name Major Triad", () => {
    // const scales2048 = new Scales2048Name()
    const pcsMajTriad = new IPcs({strPcs: "0,4,7"})
    expect(Scales2048Name.getFirstScaleNameOrDerived(pcsMajTriad)?.name).toEqual('Major Triad')
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
      Array.from(isDict, ([isValue, pcsValue]) => ({
        is: isValue,
        pcs: pcsValue,
        id88: EightyEight.idNumberOf(new IPcs({strPcs: pcsValue})),
        sources: [
          {
            "name": '',
            "url": '',
            "type": ''
          }
        ]
      }));

    expect(array[42].id88).toEqual(28)

    expect(array.length).toEqual(2048)
    // console.log(JSON.stringify(array))
    // console.log(JSON.stringify(array.length))
  })

  it("find id88 2048Name", () => {
    expect(scales2048.length).toEqual(2048)

    const pcs = scales2048.find((s: IScaleName) => s.is == "2,2,1,2,2,2,1")
    expect(pcs.id88).toEqual(38)
  })

  it("find first name pcs:0,2,3,7,11", () => {
    expect(scales2048.length).toEqual(2048)

    const pcs = new IPcs({strPcs:"[0,2,3,7,11]"})
    let scaleName = Scales2048Name.getFirstScaleNameOrDerived(pcs)?.name ?? ''
    expect(scaleName).toEqual('Zagitonic')

    pcs.setPivot(3)
    scaleName = Scales2048Name.getFirstScaleNameOrDerived(pcs)?.name ?? ''
    // before integration scales name ianring
    // expect(scaleName).toEqual('degree 2 of Lagitonic')
    // after:
    expect(scaleName).toEqual('Dolitonic')

  })

  // TODO : Unit Test for Scales2048Name.getLinksNameDefs()


  // it("convert to new interface with INameDefLink", () => {
    // Example of update from existing data (set id88 value)
    // for (let i = 0; i < scales2048.length; i++) {
    //   const pcs = new IPcs({strPcs:scales2048[i].pcs})
    //   scales2048[i].id88 = EightyEight.idNumberOf(pcs)
    // }

    // let new2048Scales: IScaleNameNew[] = []
    //
    // for (let i = 0; i < scales2048.length; i++) {
    //   const links = scales2048[i].sources
    //   const names = scales2048[i].name.split("|")
    //
    //   if (links.length != names.length) {
    //     console.log(scales2048[i].pcs)
    //   }
    //   expect(links.length).toEqual(names.length)
    //   let res: INameDefLink[] = []
    //   for (let j = 0; j < names.length; j++) {
    //     let typeSource = ''
    //     if (links[j].includes("wikipedia")) typeSource = "wikipedia"
    //     else if (links[j].includes("ianring")) typeSource = "ianring"
    //     else if (links[j].includes("allthescales")) typeSource = "allthescales"
    //     else if (links[j].includes("stanleyjordan")) typeSource = "stanleyjordan"
    //     res.push(
    //       {
    //         name: names[j],
    //         url: links[j],
    //         type: typeSource
    //       })
    //   }
    //   new2048Scales.push({
    //     is: scales2048[i].is,
    //     pcs: scales2048[i].pcs,
    //     id88: scales2048[i].id88,
    //     sources: res
    //   })
    // }
    // console.log(JSON.stringify(new2048Scales))
  // })
/*
  it("generate array 2048 pid and is", () => {
    expect(scales2048.length).toEqual(2048)
    let array2048pid: number[] = []
    let array2048sid: string[] = []
    scales2048.forEach((s:IScaleName) => {
      const pcs = new IPcs({strPcs:s.pcs})
      array2048pid.push(pcs.pid())
      array2048sid.push(pcs.is().toString())
    })
    // console.log(JSON.stringify(array2048pid))
    console.log(JSON.stringify(array2048sid))
  })
*/

  /*
  it("prepare and update 2048 from ianring scale names", () => {
    expect(scales2048.length).toEqual(2048)
    // let array2048pid: number[] = []
    // let array2048sid: string[] = []
    // scales2048.forEach((s:IScaleName) => {
    //   const pcs = new IPcs({strPcs:s.pcs})
    //   array2048pid.push(pcs.pid())
    //   array2048sid.push(pcs.is().toString())
    // })
    // console.log(JSON.stringify(array2048pid))
    // console.log(JSON.stringify(array2048sid))
    // bs4-web-scraping-ianring.py for generate
    // python3 ./bs4-web-scraping-ianring.py > ianringScaleNames.ts

    expect(Ianring.ianringScaleNames.size).toEqual(2048)

    scales2048.forEach((s: IScaleName) => {
      const pcs = new IPcs({strPcs: s.pcs})
      const nameScale = Ianring.ianringScaleNames.get(s.is)
      if (nameScale) {
        const scaleNames = Scales2048Name.getScale2048Name(pcs)
        if (scaleNames.sources.find((s) => s.name == nameScale)) {
          // already exists
        } else {
          const nameScaleDef: INameDefLink = {
            name: nameScale,
            url: 'https://ianring.com/musictheory/scales/' + pcs.pid(),
            type: 'ianring'
          }
          if (scaleNames.sources[0].name) {
            // add a new entry
            scaleNames.sources.push(nameScaleDef)
          } else {
            // update first entry (default name is empty)
            scaleNames.sources[0] = nameScaleDef
          }
        }
      }
    })
    // console.log(JSON.stringify(scales2048))
  })
*/
})
