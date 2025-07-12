import {PcsUtils} from "./PcsUtils";
import {MusaicOperation} from "../core/MusaicOperation";
import {IPcs} from "../core/IPcs";

describe('PcsUtils test', () => {


  it('compare modulo implementation', () =>{
    // const negativeToPositiveModulo = (i: number, n: number): number => {
    //   return (n + i % n) % n
    // }

    const loop = 1000000

    // truncated division (see https://en.wikipedia.org/wiki/Modulo)
    const modulo = (i:number, n:number) => {
      return i - Math.floor(i/n) * n
    }

    for (let i = -200; i < 200; ++i) {

      let y1 = modulo(i, 12)
      let y2 = modulo(i, 12)

      expect(y1).toEqual(y2)
      expect(y1).toBeLessThan(12)
      expect(y1).toBeGreaterThanOrEqual(0)

    }

/*
   negativeToPositiveModulo is 1.5 times more speed than truncated modulo

    let start = window.performance.now() //new Date().getTime();
    for (let i = 0; i < loop; ++i) {
      let y = modulo(i, 12)
    }

    let end = window.performance.now() //new Date().getTime();
    let time1 = end - start;
    console.log('Execution time1: ' + time1);

    start = window.performance.now()

    for (let i = 0; i < loop; ++i) {
      let y = negativeToPositiveModulo(i, 12)
    }

    end = window.performance.now()
    let time2 = end - start;
    console.log('Execution time2: ' + time2);
*/
  })



  it("Resolve equation  ak' + k ≡ 0 (mod n) for k'", () => {

    let a = 3; // Example value for `a`
    let k = 4; // Example value for `k`
    let n = 7; // Example value for `n`

    let kPrime = PcsUtils.solveEquation(a, k, n)
    expect(kPrime).toEqual(1);

    n=12
    const id =  new MusaicOperation(12, 1, 0, false);

    a=5
    k=5
    kPrime = PcsUtils.solveEquation(a, k, n)
    expect(kPrime).toEqual(11);
    // console.log(`kprime : ${kPrime}`)

    // M5T5 inverse is M5T11
    const opM5T5 = new MusaicOperation(12, a, k, false);
    const inverse1 = new MusaicOperation(n, a, kPrime, false);
    // console.log(`inverse : ${inverse1.toString()}`)
    // console.log(`pcs * inverse : ${opM5T5.compose(inverse1).toString()}`)
    expect(id.equals(opM5T5.compose(inverse1))).toBeTrue();
    expect(id.equals(inverse1.compose(opM5T5))).toBeTrue();

    // CM5T5 inverse is CM5T11
    const inverse2 = new MusaicOperation(n, a, kPrime, true);
    const opCM5T5 = new MusaicOperation(12, a, k, true);
    expect(id.equals(opCM5T5.compose(inverse2))).toBeTrue();

    a=1
    k=5
    // M1T5 inverse is M1-T7
    kPrime = PcsUtils.solveEquation(a, k, n)
    let inverse = new MusaicOperation(n, a, kPrime, false);
    // console.log(`inverse : ${inverse.toString()}`)
    const opM1T5 = new MusaicOperation(12, a, k, false);
    expect(id.equals(opM1T5.compose(inverse))).toBeTrue();
  })

  it('test getInverse ', () => {
    const id =  new MusaicOperation(12, 1, 0, false);

    const opCM5T5 = new MusaicOperation(12, 5, 5, true);
    const opCM5T11 = new MusaicOperation(12, 5, 11, true);

    expect(opCM5T11.compose(opCM5T5).equals(id)).toBeTrue()
    // console.log("inverse ", PcsUtils.getInverse(opCM5T5).toString())
    // same but get inverse
    expect(PcsUtils.getInverse(opCM5T5).equals(opCM5T11)).toBeTrue()
    // associative
    expect(PcsUtils.getInverse(opCM5T11).equals(opCM5T5)).toBeTrue()
  })


  it('compare with Tk', () => {
    let array = ["M1-T0", "M11-T1", "M11-T11",  "M11-T3",  "M11-T5"]
    array.sort(PcsUtils.compareOpCMaTkReducedOrNot)
    expect(array).toEqual(["M1-T0", "M11-T1", "M11-T3",  "M11-T5",  "M11-T11"])
  })

  it('compare without Tk', () => {
    let array = ["M1", "M11", "CM11",  "M5",  "CM7"]
    array.sort(PcsUtils.compareOpCMaWithoutTk)
    expect(array).toEqual(["M1", "M5", "M11",  "CM7",  "CM11"])
  })

  it('pcsStringToStringPreFormated unit tests', () => {
    const string1 =  "0369"  //=> "0 3 6 9"
    const string2 = "1110" //  => "11 10"
    const string3 = "10110" // => "10 11 0",
    const string4 = "0 4 8" // => "0 4 8",
    expect(PcsUtils.pcsStringToStringPreFormated(string1)).toEqual("0 3 6 9")
    expect(PcsUtils.pcsStringToStringPreFormated(string2)).toEqual("11 10")
    expect(PcsUtils.pcsStringToStringPreFormated(string3)).toEqual("10 11 0")
    expect(PcsUtils.pcsStringToStringPreFormated(string3, {separator:','})).toEqual("10,11,0")
    expect(PcsUtils.pcsStringToStringPreFormated(string4)).toEqual(string4)
    expect(PcsUtils.pcsStringToStringPreFormated("047")).toEqual("0 4 7")
    expect(PcsUtils.pcsStringToStringPreFormated("101")).toEqual("10 1")
    expect(PcsUtils.pcsStringToStringPreFormated("101", {separator:','})).toEqual("10,1")
    expect(PcsUtils.pcsStringToStringPreFormated("0 4 7", {separator:','})).toEqual("0,4,7") // no change
    expect(PcsUtils.pcsStringToStringPreFormated("0 4 7")).toEqual("0 4 7") // no change
    expect(PcsUtils.pcsStringToStringPreFormated("0 4 7A")).toEqual("0 4 7 10") // A => 10

    expect(PcsUtils.pcsStringToStringPreFormated("047", {separator:','})).toEqual("0,4,7")

    expect(PcsUtils.pcsStringToStringPreFormated("123")).toEqual("1 2 3")
    expect(PcsUtils.pcsStringToStringPreFormated("1234")).toEqual("1 2 3 4")

    expect(PcsUtils.pcsStringToStringPreFormated("11112")).toEqual("11 11 2")
    expect(PcsUtils.pcsStringToStringPreFormated("11112", {duplicationValues:false})).toEqual("11 2")
    expect(PcsUtils.pcsStringToStringPreFormated("1AB")).toEqual("1 10 11")
    expect(PcsUtils.pcsStringToStringPreFormated("047AB311",{duplicationValues:false})).toEqual("0 4 7 10 11 3")
    expect(PcsUtils.pcsStringToStringPreFormated("04 7A B,311", {duplicationValues: false})).toEqual("0 4 7 10 11 3")
    expect(PcsUtils.pcsStringToStringPreFormated("12d - 6610B", {duplicationValues: false})).toEqual("1 2 6 10 11")
    expect(PcsUtils.pcsStringToStringPreFormated("12d - 6610B11", {separator:',', duplicationValues: false})).toEqual("1,2,6,10,11")
    expect(PcsUtils.pcsStringToStringPreFormated("12d - 6610B11", {separator:',', duplicationValues: false})).toEqual("1,2,6,10,11")

    expect(PcsUtils.pcsStringToStringPreFormated("3333", {separator:',', duplicationValues:true})).toEqual("3,3,3,3")
    expect(PcsUtils.pcsStringToStringPreFormated("11111", {separator:',', duplicationValues:true})).toEqual("11,11,1")
    // expect(PcsUtils.pcsStringToStringPreFormated("1,,1,,,1,,,,,1,1", {separator:',', duplicationValues:true})).toEqual("11,11,1")
    expect(PcsUtils.pcsStringToStringPreFormated("1 1 1 1 1", {separator:',', duplicationValues:true})).toEqual("1,1,1,1,1")
    expect(PcsUtils.pcsStringToStringPreFormated("11 1 1 1", {separator:',', duplicationValues:true})).toEqual("11,1,1,1")
    expect(PcsUtils.pcsStringToStringPreFormated("12, 12,,12,12,12,6", {separator:',', duplicationValues:true})).toEqual("1,2,1,2,1,2,1,2,1,2,6")
    expect(PcsUtils.pcsStringToStringPreFormated("10,10,10,10,10,5", {separator:',', duplicationValues:true})).toEqual("10,10,10,10,10,5")

    expect(PcsUtils.pcsStringToStringPreFormated("1 1 07A B", {duplicationValues:false})).toEqual("1 0 7 10 11")
    expect(PcsUtils.pcsStringToStringPreFormated("1 07A B", {separator:',', duplicationValues:false})).toEqual("1,0,7,10,11")

  })

  it('getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk', () =>{
    let ipcs1 = new IPcs({strPcs: ""})
    let ipcs2 = new IPcs({strPcs: "0"})
    let ipcs3 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivotParam: 4})
    let ipcs4 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivotParam: 0})

    let pcsSym = PcsUtils.getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(ipcs1)
    expect(pcsSym.k).not.toBeDefined()
    expect(pcsSym.pcs.id).toEqual(ipcs1.id)

    pcsSym = PcsUtils.getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(ipcs2)
    expect(pcsSym.k).toBeDefined()
    expect(pcsSym.k).toEqual(0)
    expect(pcsSym.pcs.id).toEqual(ipcs2.id)

    pcsSym = PcsUtils.getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(ipcs3)
    expect(pcsSym.k).toBeDefined()
    expect(pcsSym.k).toEqual(0)
    expect(pcsSym.pcs.id).toEqual(ipcs3.id)

    pcsSym = PcsUtils.getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(ipcs4)
    expect(pcsSym.k).toBeDefined()
    expect(pcsSym.k).toEqual(0)
    expect(pcsSym.pcs.id).toEqual(ipcs3.id)

    let diatMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 0})
    pcsSym = PcsUtils.getPcsHavingMinimalPivotAndMinimalValueOfTkForStabM11_Tk(diatMaj)
    expect(pcsSym.k).toBeDefined()
    expect(pcsSym.k).toEqual(0) // diatonic major is naturally symmetric
  })

  it('static minkValueThatStabByMInverseOp_Tk(pcs: IPcs) ', () =>  {
    let ipcs1 = new IPcs({strPcs: ""})
    let ipcs2 = new IPcs({strPcs: "0"})
    let ipcs3 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivotParam: 4})
    let ipcs4 = new IPcs({strPcs: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11", iPivotParam: 0})
    let diatMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 0})

    let kMin = PcsUtils.minkValueThatStabByMInverseOp_Tk(ipcs1)
    expect(kMin).toEqual(0)
    kMin = PcsUtils.minkValueThatStabByMInverseOp_Tk(ipcs2)
    expect(kMin).toEqual(0)
    kMin = PcsUtils.minkValueThatStabByMInverseOp_Tk(ipcs3)
    expect(kMin).toEqual(0)
    kMin = PcsUtils.minkValueThatStabByMInverseOp_Tk(ipcs4)
    expect(kMin).toEqual(0)
    kMin = PcsUtils.minkValueThatStabByMInverseOp_Tk(diatMaj.cyclicPrimeForm())
    expect(kMin).toEqual(6)
    kMin = PcsUtils.minkValueThatStabByMInverseOp_Tk(diatMaj.cyclicPrimeForm().cloneWithNewPivot(3))
    expect(kMin).toEqual(0)
  })


  it('static isMaximalEven(pcs : IPcs)  ', () => {
    const diatonicMaj = new IPcs({strPcs: "0, 2, 4, 5, 7, 9, 11", iPivotParam: 0})
    expect(PcsUtils.isMaximalEven(diatonicMaj)).toEqual(true)

    const triadMaj = new IPcs({strPcs: "0, 4, 7", iPivotParam: 0})
    expect(PcsUtils.isMaximalEven(triadMaj)).toEqual(false)

    let pcs = new IPcs({strPcs: "0, 3, 6, 9", iPivotParam: 0})
    expect(PcsUtils.isMaximalEven(pcs)).toEqual(true)

    //page 30 figure 1.8 "Foundations of diatonic theory", Timothy A. Johnson
    pcs = new IPcs({strPcs: "0, 3, 6, 10", iPivotParam: 0})
    expect(PcsUtils.isMaximalEven(pcs)).toEqual(false)

   // fig. 1.9 (pentatonic scale, dorian complement)
    pcs = new IPcs({strPcs: "0 2 5 7 10", iPivotParam: 0})
    expect(PcsUtils.isMaximalEven(pcs)).toEqual(true)
  })

  it('getCDistanceTable', () => {
    //page 30 figure 1.8 "Foundations of diatonic theory", Timothy A. Johnson
    //   // if (pcs.pid() === 293) {
    //   //   console.log(`pcs name ${pcs.getFirstNameDetail()} array D-Distance :`)
    //   //   pcsCDistance.forEach(tab => {
    //   //     console.log(`tab[] : ${tab}`)
    //   //   })
    //   // }
    //   // if (pcs.pid() === 5) {
    //   //   console.log(`pcs name ${pcs.getFirstNameDetail()} array D-Distance :`)
    //   //   console.log(`pcsCDistance : ${pcsCDistance.length}`)
    //   //   pcsCDistance.forEach(tab => {
    //   //     console.log(`tab[] : ${tab}`)
    //   //   })
    //   // }
    let pcs = new IPcs({strPcs: "0 3 6 10", iPivotParam: 0})
    let expectedTable = [
      [2,3,4], [5,6,7], [8,9,10]
    ]
    expect(PcsUtils.getCDistanceTable(pcs)).toEqual(expectedTable)

    pcs = new IPcs({strPcs: "0 2 5 7 10", iPivotParam: 0})
    expectedTable = [
      [2,3], [4,5], [7,8] ,[9,10]
    ]
    expect(PcsUtils.getCDistanceTable(pcs)).toEqual(expectedTable)

    /// test with n = 7 mapped on Diatonic scale
    // idea :  A second order maximal evenness is maximal evenness in its dimension, as {C E G} in 7
    let pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 4]", // first 3-chord {C E G}
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]  // pcs mapped into [0,4,7]
    })

    expectedTable = [
      [2,3], [4,5]
    ]
    expect(PcsUtils.getCDistanceTable(pcsDiatMajMapped)).toEqual(expectedTable)

    pcsDiatMajMapped = new IPcs({
      strPcs: "[0, 2, 6]", // C E B
      n: 7,
      nMapping: 12,
      templateMapping: [0, 2, 4, 5, 7, 9, 11]
    })

    expectedTable = [
      [1,2,4], [3,5,6]
    ]
    expect(PcsUtils.getCDistanceTable(pcsDiatMajMapped)).toEqual(expectedTable)

  })


  it('deep scale property Diatonic Maj and Minor scales', () => {
    const pcsDiatonicMaj = new IPcs({
      n: 12,
      strPcs: "[0 2 4 5 7 9 11]"
    })
    expect(PcsUtils.deepScale(pcsDiatonicMaj)).toEqual(true)

    const pcsHarmonicMinorScale = new IPcs({
      n: 12,
      strPcs: "[0 2 3 5 7 8 11]"
    })
    expect(PcsUtils.deepScale(pcsHarmonicMinorScale)).toEqual(false)

    const pcsMelodicAscMinorScale = new IPcs({
      n: 12,
      strPcs:"[0 2 3 5 7 9 11]"
    })
    expect(PcsUtils.deepScale(pcsMelodicAscMinorScale)).toEqual(false)

    const pcsMelodicDescMinorScale = new IPcs({
      n: 12,
      strPcs: "[0 2 3 5 7 8 10]" // Aeolian mode, so same musical structure as Diatonic Major
    })
    expect(PcsUtils.deepScale(pcsMelodicDescMinorScale)).toEqual(true)

  })

})
