import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";
import {MusaicOperation} from "../core/MusaicOperation";
import {EightyEight} from "../utils/EightyEight";
import {Orbit} from "../core/Orbit";

describe('Laboratory explorer', () => {

  /////////// Math POC

  /**
   * <pre>
   * |Orbit(x)| = |G| / |Stab(x)|
   * </pre>
   *
   * i.e. cardinal of an orbit o is equals to the number operations of group
   * div by number stabilized operations of any element of the orbit o
   *
   * @see https://en.wikipedia.org/wiki/Group_action#Orbit-stabilizer_theorem_and_Burnside.27s_lemma
   */
  it('test_Orbit_Stabilizer_Theorem', () => {
    const groupMusaic = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    groupMusaic.orbits.forEach((orbit) => {
      const min: IPcs = orbit.getPcsMin()
      expect(orbit.cardinal).toEqual(groupMusaic.cardinal / min.stabilizer.cardinal)
    })
  })


  /**
   * <pre>
   * orbit-counting theorem - Burnside's lemma
   * |X/G| = (sum |Fix.g| for all g in G) / |G|
   * </pre>
   *
   * \left|X/G\right|={\frac {1}{\left|G\right|}}\sum _{g\in
   * G}\left|X^{g}\right|,
   *
   * @see https://en.wikipedia.org/wiki/Burnside%27s_lemma
   */
  it('test_Orbit_Counting_Theorem_Burnside', () => {
    const groupMusaic = GroupAction.predefinedGroupsActions(12, Group.MUSAIC)
    expect(groupMusaic.operations.length).toEqual(96)

    const totalCardFixedPcs = groupMusaic.operations.reduce(
      (cardFixedPcs: number, currentValue) =>
        currentValue.getFixedPcs().length + cardFixedPcs,
      0)

    expect(8448).toEqual(totalCardFixedPcs);

    // expect that 88 = 8448 / 96
    expect(groupMusaic.orbits.length).toEqual(totalCardFixedPcs / groupMusaic.operations.length);
    // same
    expect(88).toEqual(totalCardFixedPcs / 96);

  })


  // TODO compare enumeration sorted by cardinal (cyclic and dihedral) with
  //  Enumeration in Musical Theory by Harald Fripertinger, enumeration via Pólya’s Theorem
  //  https://www.mat.univie.ac.at/~slc/s/s26fripert.pdf



  /////////// Explore PCS lists


  it('List of scales grouped by same IV', () => {
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    expect(groupCyclic.operations.length).toEqual(12)
    expect(groupCyclic.orbits.length).toEqual(352)

    const pcsGroupedBySameIV = new Map<string, IPcs[]>
    for (const orbit of groupCyclic.orbits) {
      const pcsPF = orbit.getPcsMin()
      if (!pcsGroupedBySameIV.has(pcsPF.iv().toString())) {
        pcsGroupedBySameIV.set(pcsPF.iv().toString(), [pcsPF])
      } else {
        pcsGroupedBySameIV.get(pcsPF.iv().toString())!.push(pcsPF)
      }
    }
    // check how many groupings are there
    console.log("pcsGroupedByIV.size = " + pcsGroupedBySameIV.size)

    // TODO find reference !
    expect(pcsGroupedBySameIV.size).toEqual(200)

    console.log("Example pcs with same IV() : " + Array.from(pcsGroupedBySameIV.values())[43])

    // show pcs that are alone in this grouping
    let soloIV = 0
    let nbPcsWithIV_4 = 0
    let nbPcsWithIV_2 = 0
    let nbPcsWithIV_3 = 0
    for (const pcsGroupingByIV of pcsGroupedBySameIV) {
      if (pcsGroupingByIV[1].length == 4) {
        console.log("iv (" + pcsGroupingByIV[0] + ") shared by : " + pcsGroupingByIV[1].length + " pcs")
        nbPcsWithIV_4++
      } else if (pcsGroupingByIV[1].length == 3) {
        console.log("iv (" + pcsGroupingByIV[0] + ") shared by : " + pcsGroupingByIV[1].length + " pcs")
        nbPcsWithIV_3++
      } else if (pcsGroupingByIV[1].length == 2) {
        nbPcsWithIV_2++
      } else if (pcsGroupingByIV[1].length == 1) {
        soloIV++
      }
    }
    console.log("nb pcs with unique iv() : " + soloIV)
    console.log("nb pcs (into 352) shearing iv with more than exactly 2 others : " + nbPcsWithIV_2)
    console.log("nb pcs (into 352) shearing iv with more than exactly 3 others : " + nbPcsWithIV_3)
    console.log("nb pcs (into 352) shearing iv with more than 3 others : " + nbPcsWithIV_4)

    expect(nbPcsWithIV_2).toEqual(112)

    // do get 352 pcs, so groupCyclic.orbits.length
    expect(nbPcsWithIV_4 * 4 + nbPcsWithIV_3 * 3 + nbPcsWithIV_2 * 2 + soloIV).toEqual(352)

  });


  it('Test powerset grouped by is() Pascal Triangle', () => {
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    const mapIs = new Map<string, IPcs[]>()
    for (const pcs of groupCyclic.powerset.values()) {
      let pcsIs = pcs.is().toString()
      if (mapIs.has(pcsIs)) {
        mapIs.get(pcsIs)!.push(pcs)
      } else {
        mapIs.set(pcsIs, [pcs])
      }
    }
    expect(mapIs.size).toEqual(groupCyclic.powerset.size / 2 + 1) // 2048+1, empty matter 1 ??

    let arrayCard = Array(13).fill(0)

    for (const entryPcs of mapIs) {
      arrayCard[entryPcs[1].length]++
    }

    for (let i = (1); i < arrayCard.length; i++) {
      console.log(`[${i}] = ${arrayCard[i]}`)
    }

  })

  it('Explore all sub-groups of musaic group - up to transposition', () => {
    function numberOrbitOrderedByCardinal(orbits : Orbit[]) {
      let orbitsSortedByCardinal = new Map() // k=name orbit based on his stabs, v=array of orbits
      orbits.forEach(orbit => {
        let card = Array.from(orbitsSortedByCardinal.keys()).find(card => card === orbit.getPcsMin().cardinal)
        // orbit name based on his stabilizers and shortName
        if (!card)
          orbitsSortedByCardinal.set(orbit.getPcsMin().cardinal, [orbit])
        else
          orbitsSortedByCardinal.get(card).push(orbit)
      })
      // const isComplemented = this.group.isComplemented()
      // sort operations
      let resultOrbitsSortedByCardinal: Orbit[] = []
      // default, sort cast key to string...
      Array.from(orbitsSortedByCardinal.keys()).sort((a, b) => (Number(a) - Number(b))).forEach(card => {
        resultOrbitsSortedByCardinal.push(orbitsSortedByCardinal.get(card).length)
      })
      return resultOrbitsSortedByCardinal
    }

    let M1_T0 = new MusaicOperation(12, 1, 0);  //generated by M1_T1
    let M1_T1 = new MusaicOperation(12, 1, 1);
    let M5_T1 = new MusaicOperation(12, 5, 1);
    let M7_T1 = new MusaicOperation(12, 7, 1);
    let M11_T1 = new MusaicOperation(12, 11, 1);
    let CM1_T1 = new MusaicOperation(12, 1, 1, true);
    let CM5_T1 = new MusaicOperation(12, 5, 1, true);
    let CM7_T1 = new MusaicOperation(12, 7, 1, true);
    let CM11_T1 = new MusaicOperation(12, 11, 1, true);

    // note: M1-T1 will be injected later
    const allOperations = [M5_T1, M7_T1, M11_T1, CM1_T1, CM5_T1, CM7_T1, CM11_T1]

    const numberOps = allOperations.length
    expect(numberOps).toEqual(7)
    const cardinalPowerset = Math.pow(2, numberOps)
    expect(cardinalPowerset).toEqual(128)  // all possible combinaisons

    // key = group name, value = some operations group generator
    let groupGenerators = new Map<string, MusaicOperation[][]>()

    // start with trivial group (each pcs is its self orbit)
    let group = new Group([M1_T0])
    let someOperations = [M1_T0]
    groupGenerators.set(group.name, [someOperations])
    // console.log("=> " + group.name)
    let groupAction  = new GroupAction({n: 12, someMusaicOperations: someOperations})

    // key = group name, value = orbits cardinal (number of orbits generated by group action)
    let groupComputed = new Map<string, GroupAction>()

    // add trivial group
    groupComputed.set(group.name, groupAction)

    // now explore 2^7=128 combinaisons
    for (let i = 0; i < cardinalPowerset; i++) {
      const pcsForCombinatorial = new IPcs({pidVal: i, n: numberOps})

      someOperations = [M1_T1] // inject M1-T1, will generate M1-T0 - neutral op
      // make unique list of MusaicOperation (someOperations)
      for (let j = 0; j < pcsForCombinatorial.abinPcs.length; j++) {
        if (pcsForCombinatorial.abinPcs[j] === 1) {
          someOperations.push(allOperations[j])
        }
      }
      group = new Group(someOperations)
      // console.log(someOperations + " => group.name =" + group.name)
      if (!groupComputed.has(group.name)) {
        groupGenerators.set(group.name, [someOperations])
        // console.log("=> " + group.name)
        groupAction = new GroupAction({n: 12, someMusaicOperations: someOperations})
        groupComputed.set(group.name, groupAction)
      } else {
        // add a list of operations as "group generators"
        groupGenerators.get(group.name)?.push(someOperations)
      }
    }

    expect(groupGenerators.size).toEqual(17) // 16 +  trivial

    // sort on number of orbits
    groupComputed = new Map([...groupComputed.entries()].sort((a, b) =>
      b[1].orbits.length - a[1].orbits.length
    ))
    console.log("groupComputed.size = " + groupComputed.size) // 16 groups
    console.log("== Sub groups (" + groupComputed.size + ") ===================================")
    for (const e of groupComputed) {
      let numberOrbitByCardinal = ""
      numberOrbitOrderedByCardinal(e[1].orbits).forEach((card, index) => {
        numberOrbitByCardinal += card + " "
      })

      console.log(e[0] + ";" + e[1].orbits.length +";" + numberOrbitByCardinal)
    }
    console.log()
    console.log("== Generators family (operations group) ===================================")
    for (const e of groupComputed) {
      console.log(e[0] + " => " + e[1])
      console.log(" generators (" + groupGenerators.get(e[0])?.length + ") =")

      // TODO design better sort
      const generatorsSorted =
        groupGenerators.get(e[0])?.sort((a, b) => {
          let res = a.length - b.length
          if (res === 0) {
            res =
              a.length * a.reduce((previousValue: number, currentValue) =>
                previousValue + currentValue.getHashCode(), 0)
              - b.length * b.reduce((previousValue: number, currentValue) =>
                previousValue + currentValue.getHashCode(), 0)
          }
          return res
        })

      generatorsSorted?.forEach((g) =>
        console.log(g.map((op) => op.toString())))

      console.log("=====================================")
    }
  })

  /**
   * Specification of Major Scale is it shared by others scales ?
   * Intervallic structure major scale : 2,2,1,2,2,2,1
   */
  it("Get scales composed only by intervals 1 and 2, with no more two 1 consecutive", () => {
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    const scalesWithOnly_1_2_intervals =
      groupCyclic.orbits
        .filter(orbit => orbit.getPcsMin().is().every(bit => [1, 2].includes(bit)))
        .filter(orbit => orbit.getPcsMin().is().some(bit => bit === 1))

    // 32 - whole tone scale and [] (empty scale ??) ==> 30
    expect(scalesWithOnly_1_2_intervals.length).toEqual(30)

    // scalesWithOnly_1_2_intervals.forEach(
    //   orbit => console.log(orbit.getPcsMin().is() + " Mus n° " + EightyEight.idNumberOf(orbit.getPcsMin())))

    // no more two 1 consecutive
    const res = scalesWithOnly_1_2_intervals.filter(orbit => {
      const is = orbit.getPcsMin().is()
      let cpt1successive = 0
      let cpt2successive = 0

      for (let i = 0; i < is.length; i++) {
        if (is[i] === 1) {
          cpt1successive++
          if (cpt1successive > 1) return false
          cpt2successive = 0
        } else { // is[i] === 2
          cpt2successive++
          //if (cpt0>4) return false
          cpt1successive = 0
        }
      }
      return cpt2successive > 0 || cpt1successive > 0
    })
    res.forEach(orbit =>
      console.log(orbit.getPcsMin().is() + " Mus n° " + EightyEight.idNumberOf(orbit.getPcsMin())))
    expect(res.length).toEqual(3)
  })

  it("intervallic structure feature", () => {
    const majScale = new IPcs({strPcs: "0,2,4,5,7,9,11"})
    const featureIS = majScale.getFeatureIS()
    const featureWaiting = [1, 2]
    expect(featureIS).toEqual(featureWaiting)
  })

  it("get all pcs having same interval types that Major scale", () => {
    const majScale = new IPcs({strPcs: "0,2,4,5,7,9,11"})
    const pcsSameFeatureIS: IPcs[] = majScale.getPcsSameFeatureIS()
    console.log("PCS having same intervals that Major Scale (" + pcsSameFeatureIS.length + ")")
    pcsSameFeatureIS.forEach(pcs => console.log(pcs.is() + " Mus n° " + EightyEight.idNumberOf(pcs)))
    expect(pcsSameFeatureIS.length).toEqual(29) // 30 - chromatic scale
  })


  /*
  // not great interest...

  it("get all k' that resolve ak' + k = 0 with n = 12", () => {
    const n = 12
    const allPrimeWith12 = Group.phiEulerElements(n);
    allPrimeWith12.forEach((a) => {
      console.log(` ========== with n = ${n} and a = ${a}`)
      for (let k = 0; k < n; k++) {
        console.log(`  ${a}k'\t + ${k}\t = \t0  => \tk' ${PcsUtils.solveEquationV1(a, k, n)} \tV2 k' = \t${PcsUtils.solveEquationV2(a, k, n)}`)
      }
    })
  })

  it("get all k' that resolve ak' + k = 0 with 2 algorithms n = 7", () => {
    const n = 7
    const allPrimeWithN = Group.phiEulerElements(n);
    allPrimeWithN.forEach((a) => {
      console.log(` ========== with n = ${n} and a = ${a}`)
      for (let k = 0; k < n; k++) {
        console.log(`  ${a}k'\t + ${k}\t = \t0  => \tV1 k' = \t${PcsUtils.solveEquationV1(a, k, n)} \tV2 k' = \t${PcsUtils.solveEquationV2(a, k, n)}`)
      }
    })
  })

  it("Explore solveEquation 2 algorithms n : [2..13]", () => {
    const nMax = 13
    for (let n = 2; n <= nMax; n++) {
      let fail = false
      const allPrimeWithN = Group.phiEulerElements(n);
      loopA:
        for (let i = 0; i < allPrimeWithN.length; i++) {
          for (let k = 0; k < n; k++) {
            const a = allPrimeWithN[i]
            if (PcsUtils.solveEquationV1(a, k, n) !== PcsUtils.solveEquationV2(a, k, n)) {
              console.log(` === Fail with n = ${n}`)
              fail = true
              break loopA
            }
          }
        }
      if (!fail) console.log(`Works with n = ${n}`)
    }
  })

*/


  /* test dynamic mutable

  type TNoMutable<T> = {
    readonly [k in keyof T]: T[k];
  };

  it ("test as const", ()=> {
    let a = [0,2,4]
    console.log(a.length, a[0])
    a[0] = 42
    const b = a
    // let b = [...a] as const
    // b[0] = 12
    console.log(b.length, b[0])

    let pcs : IPcs = new IPcs({strPcs:"0,2,4,5,7,9,11"})
    pcs.iPivot = 0
    const majScale : TNoMutable<IPcs> = pcs
    // majScale.iPivot = 1 // ok, no possible
    console.log(majScale.getPcsStr())
    // let pcs2 = pcs as TNoMutable<IPcs>
    // let pcs2 = readonly pcs // no possible
    // pcs2.iPivot = 2
  })

*/

})
