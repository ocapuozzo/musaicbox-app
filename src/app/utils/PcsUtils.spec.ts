import {PcsUtils} from "./PcsUtils";
import {MusaicOperation} from "../core/MusaicOperation";

describe('PcsUtils test', () => {

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

  it('pcsStringToStringSpaced unit tests', () => {
    const string1 =  "0369"  //=> "0 3 6 9"
    const string2 = "1110" //  => "11 10"
    const string3 = "10110" // => "10 11 0",
    const string4 = "0 4 8" // => "10 11 0",
    expect(PcsUtils.pcsStringToStringSpaced(string1)).toEqual("0 3 6 9")
    expect(PcsUtils.pcsStringToStringSpaced(string2)).toEqual("11 10")
    expect(PcsUtils.pcsStringToStringSpaced(string3)).toEqual("10 11 0")
    expect(PcsUtils.pcsStringToStringSpaced(string3, ',')).toEqual("10,11,0")
    expect(PcsUtils.pcsStringToStringSpaced(string4)).toEqual(string4)
    expect(PcsUtils.pcsStringToStringSpaced("047")).toEqual("0 4 7")
    expect(PcsUtils.pcsStringToStringSpaced("101")).toEqual("10 1")
    expect(PcsUtils.pcsStringToStringSpaced("101", ',')).toEqual("10,1")
    expect(PcsUtils.pcsStringToStringSpaced("0 4 7", ',')).toEqual("0 4 7") // no change
    expect(PcsUtils.pcsStringToStringSpaced("047", ',')).toEqual("0,4,7")

  })


})
