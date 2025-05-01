import {IPcs} from "../core/IPcs";
import {GroupAction} from "../core/GroupAction";
import {Group} from "../core/Group";
import {MusaicOperation} from "../core/MusaicOperation";
import {EightyEight} from "../utils/EightyEight";
import {Orbit} from "../core/Orbit";
import {ManagerGroupActionService} from "../service/manager-group-action.service";
import {PcsUtils} from "../utils/PcsUtils";

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
    const groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
    groupMusaic.orbits.forEach((orbit) => {
      const min: IPcs = orbit.getPcsMin()
      expect(orbit.cardinal).toEqual(groupMusaic.cardinal / min.getStabilizerOperations().length)
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
    const groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!
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


  // TODO : compare enumeration sorted by cardinal (cyclic and dihedral) with
  //  Enumeration in Musical Theory by Harald Fripertinger, enumeration via Pólya’s Theorem
  //  https://www.mat.univie.ac.at/~slc/s/s26fripert.pdf
  //


  /////////// Explore PCS lists


  it('List of scales grouped by same IV', () => {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
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
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!

    // this expect allows the group to be properly initialized.... ???
    expect(groupCyclic.operations.length).toEqual(12)
    expect(groupCyclic.orbits.length).toEqual(352)

    const mapIs = new Map<string, IPcs[]>()
    // for (const pcs of groupCyclic.powerset.values()) {
    for (const pcs of Array.from(groupCyclic.powerset.values())) {
      let pcsIs = pcs.is().toString().trim()
      if (mapIs.has(pcsIs)) {
        mapIs.get(pcsIs)!.push(pcs)
      } else {
        mapIs.set(pcsIs, [pcs])
      }
    }
    expect(mapIs.size).toEqual(groupCyclic.powerset.size / 2 + 1) // empty matter 1 ??

    let arrayCard = Array(13).fill(0)

    for (const entryPcs of mapIs) {
      arrayCard[entryPcs[1].length]++
    }

    for (let i = (1); i < arrayCard.length; i++) {
      console.log(`[${i}] = ${arrayCard[i]}`)
    }

  })

  it('n=12 - Explore all sub-groups of musaic group - up to transposition', () => {
    function orbitsOrderedByCardinal(orbits: Orbit[]): Orbit[] {
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
    // key = group name, value = orbits cardinal (number of orbits generated by group action)
    let groupComputed = new Map<string, GroupAction>()

    // start with trivial group (each pcs is its self orbit)
    let group = new Group([M1_T0])
    let someOperations = [M1_T0]
    groupGenerators.set(group.name, [someOperations])
    // console.log("=> " + group.name)
    let groupAction = new GroupAction({n: 12, someMusaicOperations: someOperations})

    // first, add trivial group
    groupComputed.set(group.name, groupAction)

    // now explore 2^7=128 combinaisons
    for (let i = 0; i < cardinalPowerset; i++) {
      const pcsForCombinatorial = new IPcs({pidVal: i, n: numberOps})

      someOperations = [M1_T1] // inject M1-T1, will generate M1-T0 - neutral op
      // make unique list of MusaicOperation (someOperations)
      for (let j = 0; j < pcsForCombinatorial.vectorPcs.length; j++) {
        if (pcsForCombinatorial.vectorPcs[j] === 1) {
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
    } // for i (128 cases)

    expect(groupGenerators.size).toEqual(17) // 16 +  trivial

    // sort on number of orbits
    groupComputed = new Map([...groupComputed.entries()].sort((a, b) =>
      b[1].orbits.length - a[1].orbits.length
    ))
    console.log("groupComputed.size = " + groupComputed.size) // 16 groups
    console.log("== Sub groups (" + groupComputed.size + ") ===================================")

    for (const e of groupComputed) {
      const orbitsByCard = orbitsOrderedByCardinal(e[1].orbits)

      let stringNumberOrbitByCardinal = orbitsByCard.join(';')
      // complete by ';' if necessary
      for (let i = 0; i <= 12 - orbitsByCard.length; i++) {
        stringNumberOrbitByCardinal += ";"
      }


      //e[0] is group name, like "n=12 [M1-T0]"
      // so e[0].substring(5) avoid to get "n=12 ", therefore  "n=12 [M1-T0]" => "[M1-T0]"
      // cols : groupName; 12 entries (enum by cardinality) ; number orbits ; number ops in group ;  name (empty)
      console.log(e[0].substring(5) + ";" + stringNumberOrbitByCardinal + ";" + e[1].orbits.length + ";" + e[1].cardinal + ";")
    }
    console.log()
    console.log("== Generators family (subgroups) ===================================")
    for (const e of groupComputed) {
      console.log(e[0] + " card = " + e[1].cardinal)
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
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
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

  it("intervallic structure feature Diatonic scale", () => {
    const majScale = new IPcs({strPcs: "0,2,4,5,7,9,11"})
    const featureIS = majScale.getGenericIntervals()
    const expectedFeature = [1, 2]
    expect(featureIS).toEqual(expectedFeature)
  })

  it("get all pcs having same generic intervals that Major scale", () => {

    const majScale = new IPcs({strPcs: "0,2,4,5,7,9,11"})
    const pcsSameFeatureIS: IPcs[] = majScale.getPcsSameGenericIntervals().filter(pcs => pcs.cardinal > 4)
    expect(pcsSameFeatureIS.length).toEqual(29) // 30 - chromatic scale

    let pcsList: [IPcs, string][] = pcsSameFeatureIS.map(pcs => [pcs, EightyEight.idNumberOf(pcs)])
    const pcsSorted = pcsList.sort((a, b) => EightyEight.indexMusaic(a[1]) - EightyEight.indexMusaic(b[1]))

    let numberMusaics = new Set(pcsSorted.map(p => p[1])).size
    console.log("PCS having same intervals that Major Scale (" + pcsSameFeatureIS.length + ") for " + numberMusaics + " musaics")
    pcsSorted.forEach(pcsSorted =>
      console.log(`(${pcsSorted[0].is().toString().padEnd(22)}) pcs : ${pcsSorted[0].getPcsStr()} in Mus n° ${pcsSorted[1]} : ${pcsSorted[0].getFirstNameDetail()}`))

    const pcsHavingCardinalIn5678 = pcsSameFeatureIS.filter(pcs => [5, 6, 7, 8].includes(pcs.cardinal))
    numberMusaics = new Set(pcsHavingCardinalIn5678.map(pcs => EightyEight.idNumberOf(pcs))).size
    console.log("PCS having same intervals that Major Scale and cardinal in [5..8] (" + pcsHavingCardinalIn5678.length + ") for " + numberMusaics + " musaics")
    pcsSorted
      .filter(element => [5, 6, 7, 8].includes(element[0].cardinal))
      .forEach(pcsSorted =>
        console.log(`(${pcsSorted[0].is().toString().padEnd(22)}) in Mus n° ${pcsSorted[1].toString().padEnd(2)} : ${pcsSorted[0].getFirstNameDetail()}`))

  })

  it("get all pcs in Deep Scale as Diatonic Major scale", () => {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    let pcsHavingDeepScale: Orbit[] = []
    groupCyclic.orbits.forEach(orbit => {
      // Deep Scale has no repetition in their Interval Vector
      if ([...new Set(orbit.getPcsMin().iv())].length === 6) pcsHavingDeepScale.push(orbit)
    })
    expect(pcsHavingDeepScale.length).toBeGreaterThan(0)
    console.log(" pcsHavingDeepScale : ", pcsHavingDeepScale.length)

    let pcsList: [IPcs, string][] = pcsHavingDeepScale.map(orbit => [orbit.getPcsMin(), EightyEight.idNumberOf(orbit.getPcsMin())])
    const pcsSorted = pcsList.sort((a, b) => EightyEight.indexMusaic(a[1]) - EightyEight.indexMusaic(b[1]))

    pcsSorted.forEach(pcsSorted =>
      console.log(`(${pcsSorted[0].is().toString().padEnd(22)}) pcs : ${pcsSorted[0].getPcsStr()} in Mus n° ${pcsSorted[1]}`))

  })

  it("get all pcs in Maximal Evenness as Diatonic Major scale", () => {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!

    let pcsInMaxEven = groupCyclic.orbits
      .filter(orbit => orbit.getPcsMin().isMaximalEven()
      ) // one or two distances with consecutive values ( 4,5 no 4,6)

    expect(pcsInMaxEven.length).toEqual(11)
    console.log(" cyclic orbit in Maximal Evenness : ", pcsInMaxEven.length)

    let pcsList: [IPcs, string][] = pcsInMaxEven.map(orbit => [orbit.getPcsMin(), EightyEight.idNumberOf(orbit.getPcsMin())])
    const pcsSorted = pcsList.sort((a, b) => EightyEight.indexMusaic(a[1]) - EightyEight.indexMusaic(b[1]))

    pcsSorted.forEach(pcsSorted =>
      console.log(`(${pcsSorted[0].is().toString().padEnd(23)}) pcs : ${pcsSorted[0].getPcsStr().padEnd(28)} in Mus n° ${pcsSorted[1]} : ${pcsSorted[0].getFirstNameDetail()}`))

  })

  it("get all pcs in Strict Second Order Maximal Evenness", () => {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!

    let pcsInSecondOrderMaxEven = groupCyclic.orbits
      .filter(orbit => orbit.getPcsMin().isStrictSecondOrderMaximalEven())

    expect(pcsInSecondOrderMaxEven.length).toEqual(25)
    console.log(" cyclic orbit in Second Order Maximal Evenness : ", pcsInSecondOrderMaxEven.length)

    let pcsList: [IPcs, string][] =
      pcsInSecondOrderMaxEven.map(orbit => [orbit.getPcsMin(), EightyEight.idNumberOf(orbit.getPcsMin())])

    const pcsSorted = pcsList.sort((a, b) => EightyEight.indexMusaic(a[1]) - EightyEight.indexMusaic(b[1]))

    pcsSorted.forEach(pcsSorted =>
      console.log(`(${pcsSorted[0].is().toString().padEnd(22)}) pcs : ${pcsSorted[0].getPcsStr().padEnd(20)} in Mus n° ${pcsSorted[1]} : ${pcsSorted[0].getFirstNameDetail()}`))

    // other way (Maximal Even in 7) then compare with unMap
    const triadInDiatonic7 = new IPcs({strPcs:"0 2 4", n:7, nMapping:12, templateMapping:[0,2,4,5,7,9,11]})
    // triad in 7 is known to be Maximal Even with "cardinality equals variety"
    expect(triadInDiatonic7.isMaximalEven()).toEqual(true)
    // map to 12
    const triadInDiatonic7MappedIn12 = triadInDiatonic7.unMap()
    // major triad is not Maximal Even in n = 12
    expect(triadInDiatonic7MappedIn12.isMaximalEven()).toEqual(false)
    // but is in Second Order Maximal Even, because it is Maximal Even in its dimension (n = 7)
    // even through algorithm to determine this property is different
    expect(triadInDiatonic7MappedIn12.isStrictSecondOrderMaximalEven()).toEqual(true)

    // passed, cool :))
  })


  it("get all pcs in 'deep scale'", () => {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!

    let pcsInDeepScale = groupCyclic.orbits
      .filter(orbit => PcsUtils.deepScale(orbit.getPcsMin())
      )

    expect(pcsInDeepScale.length).toEqual(4)
    console.log(" cyclic orbit in Deep Scale : ", pcsInDeepScale.length)
    pcsInDeepScale.forEach(orbit => {
      console.log(` IS : ${orbit.getPcsMin().is()}  cyclic pcs PF : ${orbit.getPcsMin().getPcsStr()} in Mus n° ${EightyEight.idNumberOf(orbit.getPcsMin())} : ${orbit.getPcsMin().symmetryPrimeForm().getNamesDetails()} `)
    })

  })


  it("for documentation : 88 musaics list with PCS representing distinct motifs", () => {
    const groupMusaic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Musaic")!

    expect(groupMusaic.orbits.length).toEqual(88)
    console.log(" 88 musaics and distinct motifs : ")
    let countMotifs = 0
    let currentMusaicCard = 1
    let currentMusaicCardIndex = 1
    groupMusaic.orbits.forEach(orbit => {
      const motifs = PcsUtils.getMusaicMotifsOf(orbit.getPcsMin(), true).map(pcs => `(${pcs.is().join(' ')})`)
      countMotifs += motifs.length
      const motifsEnum = motifs.map(motif => `\n* ${motif}`).join(' ')
      const countDistinctMotifs = 8 / orbit.metaStabilizer.metaStabOperations.length
      if (orbit.getPcsMin().cardinal !== currentMusaicCard) {
        currentMusaicCard = orbit.getPcsMin().cardinal
        currentMusaicCardIndex = 1
      } else {
        currentMusaicCardIndex++
      }
      const idMus = EightyEight.idNumberOf(orbit.getPcsMin())
      const octotrope = orbit.metaStabilizer.name.toLowerCase().split(' ').join('-')
      const imageOctotrope = ` image:octotropes/${octotrope}.png[width=50]` //  image:octotropes/m1-m5-m7-m11.png[] asciidoc
      console.log(` \n|${idMus}\n|image:88musaics/${idMus}.png[${idMus}]\n| ${countDistinctMotifs} \n|${motifsEnum}\n| ${imageOctotrope} ${orbit.metaStabilizer.name} `)
    })
    // 352 cyclic intervallic structures
    expect(countMotifs).toEqual(352)

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


  /* test dynamic immutable */

    type TNoMutable<T> = {
      readonly [k in keyof T]: T[k];
    };

    it ("test dynamic readonly", ()=> {
      let a = [0,2,4]
      console.log(a.length, a[0])
      a[0] = 42
      const b = a
      let b2 = [...a] as const
      let b3 : readonly number[] = [...a]
      b[0] = 12
      console.log(b.length, b[0])
      // b2[0] = 12   <== impossible
      console.log(b.length, b2[0])
      // b3[0] = 12    <== impossible
      console.log(b.length, b3[0])

      let pcs : IPcs = new IPcs({strPcs:"0,2,4,5,7,9,11"})
      pcs.iPivot = 0
      const majScale : TNoMutable<IPcs> = pcs
      //majScale.iPivot = 1 // ok, no possible
      // majScale.vectorPcs = [0] // impossible
      majScale.vectorPcs[0] = 42 // possible
      // console.log(majScale.getPcsStr())
      let pcs2 = pcs as TNoMutable<IPcs>
      let pcs3 : TNoMutable<IPcs> = pcs
      // let pcs4 = readonly pcs // no possible
      // let pcs4: readonly IPcs = pcs // no possible
      // pcs2.iPivot = 2 // no possible
    })



})
