import {MusaicOperation} from "./MusaicOperation";
import {IPcs, negativeToPositiveModulo} from "./IPcs";
import {ManagerGroupActionService} from "../service/manager-group-action.service";

describe('MusaicPcsOperation', () => {

  it("MusaicPcsOp testEqualsObject ", () => {
    let op1 = new MusaicOperation(12, 7, 5, true);
    let op2 = new MusaicOperation(12, 7, 5, true);
    expect(op1.equals(op2)).toEqual(true);
    op2 = new MusaicOperation(12, 7, 5, false);
    expect(op1.equals(op2)).not.toBeTruthy();
    op1 = new MusaicOperation(12, 7, 5, false)
    expect(op1.equals(op2)).toBeTruthy();
    expect(op1.equals(op1)).toBe(true)
    expect(op1.equals(null)).toBe(false)
    expect(op1.equals(42)).toBe(false)

    let op3 = new MusaicOperation(12, 5, 5, true);
    expect(op1.equals(op3)).not.toBeTruthy();
    op3 = new MusaicOperation(10, 5, 5, true);
    expect(op1.equals(op3)).not.toBeTruthy();

    op2 = new MusaicOperation(12, 7, 5, true);
    op1 = new MusaicOperation(12, 7, 0, true);
    expect(op1.equals(op2)).not.toBeTrue(); // bad t

  });

  it("MusaicPcsOp compose", () => {
    let opCM7_T5 = new MusaicOperation(12, 7, 5, true);
    let opCM7 = new MusaicOperation(12, 7, 0, true);
    let opT5 = new MusaicOperation(12, 1, 5, false);

    // action CM7 first and T5 second
    expect(opCM7_T5.equals(opT5.compose(opCM7))).toBeTrue();

    // n = 7
    const badT5 = new MusaicOperation(7, 1, 5, true);
    try {
      expect(opCM7_T5.equals(badT5.compose(opCM7))).toBeTrue();
      fail('Error because invalid n in operations')
    } catch (e: any) {
      expect(e.message).toContain("bad N in compose op")
    }
  });


  it("MusaicPcsOp compose neutral op", () => {
    let opM1T0 = new MusaicOperation(12, 1, 0, false);
    let opCM1T0 = new MusaicOperation(12, 1, 0, true);

    // M1-T0.compose(M1-T0) == M1-T0   (false !== false) => false
    // CM1-T0.compose(M1-T0) == CM1-T0 (true !== false) => true
    // CM1-T0.compose(CM1-T0) == M1-T0 (true !== true) => false

    expect(opM1T0.equals(opM1T0.compose(opM1T0))).toBeTrue();
    expect(opCM1T0.equals(opM1T0.compose(opCM1T0))).toBeTrue();
    expect(opCM1T0.equals(opCM1T0.compose(opM1T0))).toBeTrue();
    expect(opM1T0.equals(opCM1T0.compose(opCM1T0))).toBeTrue();

  })

  it("MusaicPcsOp compose  op", () => {
    // M3-T5 . M3-T2 = M9-T11
    //  (this.c,this.a,this.t) (c',a',t') = ( c xor c', aa', at' + t)
    let opM3T5 = new MusaicOperation(12, 3, 5, false);
    let opM3T2 = new MusaicOperation(12, 3, 2, false);
    let opM9T11 = new MusaicOperation(12, 9, 11, false);
    expect(opM9T11.equals(opM3T5.compose(opM3T2))).toBeTrue();

    let opCM3T5 = new MusaicOperation(12, 3, 5, true);
    let opCM9T11 = new MusaicOperation(12, 9, 11, true);
    expect(opCM9T11.equals(opCM3T5.compose(opM3T2))).toBeTrue();

    let opCM3T10 = new MusaicOperation(12, 3, 10, true);
    let opCM9T4 = new MusaicOperation(12, 9, 4, true);
    expect(opCM9T4.equals(opCM3T10.compose(opM3T2))).toBeTrue();
  })

  it("MusaicPcsOp testActionOn", () => {
    let pcs = new IPcs({strPcs: "0,3,4,7,8,11"});
    let opCM7_T5 = new MusaicOperation(12, 7, 5, true);
    // n = 12, CM7_T5 is stabilizer for Pcs("0,3,4,7,8,11")

    let newPcs = opCM7_T5.actionOn(pcs)

    expect(pcs.equalsPcsById(newPcs)).toBeTruthy();

    let opCM7 = new MusaicOperation(12, 7, 0, true);
    let opT5 = new MusaicOperation(12, 1, 5, false);
    expect(pcs.equalsPcsById(opT5.actionOn(opCM7.actionOn(pcs)))).toBeTruthy();
  });

  it("MusaicPcsOp test op stab sort", () => {
    // So:    M1-T3, M1-T0, CM1-T5, M5-T0, CM7-T8, CM7-T3
    // give : M1-T0, M5-T0, M1-T3, CM7-T3, CM1-T5, CM7-T8
    let opCM7_T3 = new MusaicOperation(12, 7, 3, true);
    let opCM7_T8 = new MusaicOperation(12, 7, 8, true);
    let opM1_T0 = new MusaicOperation(12, 1, 0, false);
    let opM1_T3 = new MusaicOperation(12, 1, 3, false);
    let opM5_T0 = new MusaicOperation(12, 5, 0, false);
    let opCM1_T5 = new MusaicOperation(12, 1, 5, true);

    let ops = [opCM1_T5, opM1_T3, opM1_T0, opM5_T0, opCM7_T8, opCM7_T3]

    let opsSortedExpected = [opM1_T0, opM5_T0, opM1_T3, opCM7_T3, opCM1_T5, opCM7_T8]

    expect(ops).not.toEqual(opsSortedExpected)
    // expect(ArrayUtil.objectsEqual(ops, opsSortedExpected)).toBeFalse() <== redundant

    ops.sort(MusaicOperation.compareStabMajorTMinorA)

    // ops.forEach( (op) => console.log(op._strRepr) )

    expect(ops).toEqual(opsSortedExpected)
    // expect(ArrayUtil.objectsEqual(ops, opsSortedExpected)).toBeTrue() <== redundant
  })


  it("MusaicPcsOp test sort", () => {
    let opCM7_T5 = new MusaicOperation(12, 7, 5, true);
    let opM1_T0 = new MusaicOperation(12, 1, 0, false);
    let opM1_T3 = new MusaicOperation(12, 1, 3, false);
    let opM1_T11 = new MusaicOperation(12, 1, 11, false);
    let opM7_T5 = new MusaicOperation(12, 7, 5, false);

    let ops = [opCM7_T5, opM1_T3, opM1_T0, opM7_T5, opM1_T11]

    let opsSortedexpected = [opM1_T0, opM1_T3, opM1_T11, opM7_T5, opCM7_T5]

    expect(ops).not.toEqual(opsSortedexpected)

    ops.sort(MusaicOperation.compare)

    expect(ops).toEqual(opsSortedexpected)
  })


  // Essential properties of Composition in Category (id, associative)
  // https://bartoszmilewski.com/2014/11/04/category-the-essence-of-composition/

  it("identity operation", () => {
    let opId = new MusaicOperation(12, 1, 0, false);
    expect(opId.compose(opId).equals(opId)).toBeTrue()
    let opM5_T3 = new MusaicOperation(12, 5, 3, false);
    expect(opId.compose(opM5_T3).equals(opM5_T3)).toBeTrue()
    expect(opM5_T3.compose(opId).equals(opM5_T3)).toBeTrue() // associative

    let opCM5_T3 = new MusaicOperation(12, 5, 3, true);
    expect(opId.compose(opCM5_T3).equals(opCM5_T3)).toBeTrue()
    expect(opCM5_T3.compose(opId).equals(opCM5_T3)).toBeTrue() // associative

  })

  it("no Commutative but Associative operation ", () => {
    let opM1_T2 = new MusaicOperation(12, 1, 2, false);
    let opM1_T3 = new MusaicOperation(12, 1, 3, false);
    let opM1_T11 = new MusaicOperation(12, 1, 11, false);

    // no multiplication => commutative
    // action T3 first and T11 second
    expect(opM1_T2.equals(opM1_T11.compose(opM1_T3))).toBeTrue();
    // action T11 first and T3 second
    expect(opM1_T2.equals(opM1_T3.compose(opM1_T11))).toBeTrue();

    let opM8_T2 = new MusaicOperation(12, 8, 2, false);
    let opM4_T3 = new MusaicOperation(12, 4, 3, false);
    let opM5_T11 = new MusaicOperation(12, 5, 11, false);
    let opM8_T11 = new MusaicOperation(12, 8, 11, false);

    // associative ?  f . (g . h) = (f . g) . h
    let left: MusaicOperation = opM8_T2.compose(opM5_T11.compose(opM4_T3))
    let right: MusaicOperation = opM8_T2.compose(opM5_T11).compose(opM4_T3)
    expect(right.equals(left)).toBeTrue()

    // commutative if t=0 (no transposition)
    let opM7_T0 = new MusaicOperation(12, 7, 0, false);
    let opM5_T0 = new MusaicOperation(12, 5, 0, false);
    const op1 = opM7_T0.compose(opM5_T0)
    const op2 = opM5_T0.compose(opM7_T0)
    expect(op1.equals(op2)).toBeTrue()

    // No commutative
    // action  M5-T11 ° M4-T3 => opM8-T2
    expect(opM8_T2.equals(opM5_T11.compose(opM4_T3))).toBeTrue()
    // action  M5-T11 ° M4-T3 <> M4-T3 ° M5-T11
    expect(opM8_T2.equals(opM4_T3.compose(opM5_T11))).not.toBeTrue()
    // action  M4-T3  ° M5-T11 => opM8-T11 (not opM8-T2)
    expect(opM4_T3.compose(opM5_T11).equals(opM8_T11)).toBeTrue()
    expect(opM4_T3.compose(opM5_T11).equals(opM8_T2)).not.toBeTrue()

    let opCM8_T2 = new MusaicOperation(12, 8, 2, true);
    let opCM5_T11 = new MusaicOperation(12, 5, 11, true);

    expect(opCM8_T2.equals(opCM5_T11.compose(opM4_T3))).toBeTrue()
    // action  CM5-T11 ° M4-T3 <> M4-T3 ° CM5-T11
    expect(opCM8_T2.equals(opM4_T3.compose(opCM5_T11))).not.toBeTrue()

    // TODO more test ?

  })

  it('getFixedPcs', () => {
    const groupCyclic = ManagerGroupActionService.getGroupActionFromGroupAliasName("Cyclic")!
    const op = groupCyclic.operations[2]

    expect(op.toString()).toEqual('M1-T2')
    expect(op.getFixedPcs().length).toEqual(4)

    // fixed pcs :
    // '[]'
    // '[0,2,4,6,8,10]'
    // '[1,3,5,7,9,11]'
    // '[0,1,2,3,4,5,6,7,8,9,10,11]'

    const ipcs: IPcs = op.getFixedPcs()[3]

    expect(ipcs.getPcsStr()).toEqual('[0 1 2 3 4 5 6 7 8 9 10 11]')
  })

  it('convertReprStringOfMusaicOperationsToArrayOfMusaicOperations', () => {
    //["M1-T0", "CM5-T5"]
    const opM1T0 = new MusaicOperation(12, 1, 0, false)
    const opM11T9 = new MusaicOperation(12, 11, 9, false)
    const opCM5T5 = new MusaicOperation(12, 5, 5, true)
    let names = ["M1-T0", "M11-T9"]
    let opsexpected = [opM1T0, opM11T9]
    let ops = MusaicOperation.convertArrayStringsToArrayOfMusaicOperations(12, names)

    expect(opsexpected).toEqual(ops)

    names = ["M1-T0", "CM5-T5"]
    opsexpected = [opM1T0, opCM5T5]
    ops = MusaicOperation.convertArrayStringsToArrayOfMusaicOperations(12, names)
    expect(opsexpected).toEqual(ops)

  })

  it('temp verify reduction extended operation with pivot', () => {
    // a(-(a'-1)p' + k') + (-(a-1)p + k))
    const p = 1
    const pPrime = 2
    const a = 5
    const aPrime = 7
    const k = 2
    const kPrime = 3
    const res1 = a * (-(aPrime - 1) * pPrime + kPrime) + (-(a - 1) * p + k)
    // const res1bis =  a * ( -aPrime *  pPrime + pPrime + kPrime) + -a*p +p + k
    // const res1ter = -a * aPrime * pPrime + a * pPrime +a * kPrime -a*p + p + k
    //-aa'p' + ap' +ak' -ap + p + k
    const res2 = -a * pPrime * (a + 1) + p * (1 - a) + a * kPrime + k
    // -ap'(a + 1) + p(1-a) + ak' + k
    // console.log(`res1 = ${res1} resIbis = ${res1bis} resIter = ${res1ter} res2 = ${res2}`)
    const n = 12
    const res3 = (n - a) * pPrime * (a + 1) + p * (n + 1 - a) + a * kPrime + k
    // -ap'(a + 1) + p(1-a) + ak' + k

    // console.log(`res1 = ${res1} res2 = ${res2} res3 = ${res3} `)
    expect(res1).toEqual(res2)
    expect(res2).toEqual(-47)
    expect(negativeToPositiveModulo(res2, 12)).toEqual(1)
    expect(negativeToPositiveModulo(res3, 12)).toEqual(1)
  })

  it(' affine op when a > 1 with pcs mapped', () => {
    const pcsTest = new IPcs({strPcs: "0 2 4", n: 7, nMapping: 12, templateMapping: [0, 9, 11, 2, 7, 5, 4]})
    expect(pcsTest.getMappedPcsStr()).toEqual("[0 7 11]")

    const pcs = new IPcs({strPcs: "0 2 4", n: 7, nMapping: 12, templateMapping: [0, 2, 4, 5, 7, 9, 11]})
    const pcsInOrbit = ManagerGroupActionService.getGroupActionFromGroupName("n=7 [M1, M2]")?.getIPcsInOrbit(pcs)!
    const opM11T0 = MusaicOperation.convertStringOpToMusaicOperation("M11-T0")
    const opM11T3 = MusaicOperation.convertStringOpToMusaicOperation("M11-T3")

    expect(pcs.n).toEqual(7)
    expect(pcs.nMapping).toEqual(12)

    expect(pcsInOrbit.n).toEqual(7)
    expect(pcsInOrbit.nMapping).toEqual(12)

    expect(pcs.getMappedPcsStr()).toEqual("[0 4 7]")
    expect(pcsInOrbit.getMappedPcsStr()).toEqual("[0 4 7]")

    let newPcs = opM11T0.actionOn(pcs)
    expect(newPcs.isComingFromOrbit()).toBeFalse()
    expect(newPcs.getMappedPcsStr()).toEqual("[0 5 8]")

    newPcs = opM11T3.actionOn(pcs)
    expect(newPcs.isComingFromOrbit()).toBeFalse()
    expect(newPcs.getMappedPcsStr()).toEqual("[3 8 11]")

    newPcs = opM11T3.actionOn(pcsInOrbit)
    expect(newPcs.n).toEqual(7)
    expect(newPcs.nMapping).toEqual(12)
    expect(newPcs.isComingFromOrbit()).toBeTrue()
    expect(newPcs.getMappedPcsStr()).toEqual("[3 8 11]")

  })

  // from documentation spec examples

  it('affinePivot : neutral op', () => {
    // With p = 0 and a = 1 and k = 0
    // (a,p(1−a)+k) = (1,0)
    //
    const pcs = new IPcs({strPcs: "047"})
    const vector = pcs.vectorPcs

    const newVector = MusaicOperation.affinePivot(1, 0, 0, vector)

    expect(newVector).toEqual(pcs.affineOp(1, 0).vectorPcs)
    expect(newVector).toEqual(vector)
  })

  it('affinePivot : transposition op', () => {
    // With p = 0 and a = 1
    //
    // (a,p(1−a)+k) = (1,k)

    const pcs = new IPcs({strPcs: "047"})
    const vector = pcs.vectorPcs
    let newVector = MusaicOperation.affinePivot(1, 1, 0, vector)
    expect(newVector).toEqual(pcs.transposition(1).vectorPcs)

    newVector = MusaicOperation.affinePivot(1, 12, 0, vector)
    expect(newVector).toEqual(pcs.vectorPcs)

    newVector = MusaicOperation.affinePivot(1, 4, 0, vector)
    expect(newVector).toEqual(pcs.transposition(4).vectorPcs)

  })

  it('affinePivot : basic affine with no pivot', () => {

    let a = 7
    let k = 3
    let p = 0

    // console.log(`a=${a} k=${k} p=${p}`)

    let pcs = new IPcs({strPcs: "0247"}) // 0 is pivot
    // console.log("vector      ", pcs.vectorPcs, pcs.iPivot)

    let newVector2 = MusaicOperation.affinePivot(a, k, p, pcs.vectorPcs)
    expect(newVector2).toEqual([0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0])

    // console.log("newVector2  ", newVector2)

    let pcsComputedByAffineOp = pcs.affineOp(a, k)
    //[3 4 5 7] 3

    expect(pcsComputedByAffineOp.iPivot).toEqual(3)
    expect(pcsComputedByAffineOp.vectorPcs).toEqual(newVector2)

    // console.log(pcsComputedByAffineOp.vectorPcs, pcsComputedByAffineOp.iPivot)
    // console.log(pcsComputedByAffineOp.getPcsStr(), pcsComputedByAffineOp.iPivot)

  })

  it('affinePivot : with pivot value', () => {
    //
    // With p = 2 and a = 11 and k = 3
    //
    // (a,p(1−a)+k)
    //
    // (11,2⋅(1−11)+3)
    //
    // (11,−17)
    //
    // (11,7) modulo 12

    let a = 11
    let k = 3
    let p = 2

    // console.log(`a=${a} k=${k} p=${p}`)

    let pcs = new IPcs({strPcs: "2047"}) // 2 is pivot
    // console.log("vector    ", pcs.vectorPcs, pcs.iPivot)

    let newVector2 = MusaicOperation.affinePivot(a, k, p, pcs.vectorPcs)
    // console.log("newVector2  ", newVector2)
    let pcsComputedByAffineOp = pcs.affineOp(a, k)
    // console.log("affine op v ", pcsComputedByAffineOp.vectorPcs)

    expect(pcsComputedByAffineOp.vectorPcs).toEqual(newVector2)
    // console.log(pcsComputedByAffineOp.getPcsStr(), pcsComputedByAffineOp.iPivot)

    a = 5
    k = 3
    p = 2

    // console.log("\n=====================")
    // console.log(`a=${a} k=${k} p=${p}`)
    pcs = new IPcs({strPcs: "2"}) // 2 is pivot
    // console.log("vector      ", pcs.vectorPcs, pcs.iPivot)

    newVector2 = MusaicOperation.affinePivot(a, k, p, pcs.vectorPcs)

    // console.log("newVector2  ", newVector2)
    pcsComputedByAffineOp = pcs.affineOp(a, k)
    expect(pcsComputedByAffineOp.vectorPcs).toEqual(newVector2)
    // console.log(pcsComputedByAffineOp.getPcsStr(), pcsComputedByAffineOp.iPivot)

    ///////////////////////////// neutral op with pivot > 0

    a = 1
    k = 0
    p = 4

    pcs = new IPcs({strPcs: "407"}) // 4 is pivot
    newVector2 = MusaicOperation.affinePivot(a, k, p, pcs.vectorPcs)
    expect(pcs.vectorPcs).toEqual(newVector2)
  })

  it('affinePivot : with complement', () => {
    // from doc
    // CM5-T4  :  CM5T4([0 4 7])→[1 2 5 6 7 8 9 10 11] (M5, T4 and Complement)
    let pcs = new IPcs({strPcs: "047"}) // 0 is pivot
    let expectedPcs = new IPcs({strPcs:"[1 2 5 6 7 8 9 10 11]"})
    let newVectorPcs = MusaicOperation.affinePivot(5, 4, 0, pcs.vectorPcs, true)
    expect(newVectorPcs).toEqual(expectedPcs.vectorPcs)

    // pivot = 2
    pcs = new IPcs({strPcs: "240710"}) // 2 is pivot
    expectedPcs = new IPcs({strPcs:"[1 3 4 5 6 7 9]"})
    newVectorPcs = MusaicOperation.affinePivot(7, -2, 0, pcs.vectorPcs, true)
    expect(newVectorPcs).toEqual(expectedPcs.vectorPcs)
  })

})
