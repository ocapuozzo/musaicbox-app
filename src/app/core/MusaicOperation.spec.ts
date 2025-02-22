import {MusaicOperation} from "./MusaicOperation";
import {IPcs} from "./IPcs";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";

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
      fail('Waiting exception because invalid n in operations')
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

    expect(pcs.equalsPcs(newPcs)).toBeTruthy();

    let opCM7 = new MusaicOperation(12, 7, 0, true);
    let opT5 = new MusaicOperation(12, 1, 5, false);
    expect(pcs.equalsPcs(opT5.actionOn(opCM7.actionOn(pcs)))).toBeTruthy();
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

    let ops = [opM1_T3, opM1_T0,  opCM1_T5 , opM5_T0, opCM7_T8, opCM7_T3]

    let opsSortedWaiting = [opM1_T0, opM5_T0, opM1_T3, opCM7_T3, opCM1_T5, opCM7_T8]

    expect(ops).not.toEqual(opsSortedWaiting)

    ops.sort(MusaicOperation.compareStabMajorTMinorA)

    // ops.forEach( (op) => console.log(op._strRepr) )

    expect(ops).toEqual(opsSortedWaiting)
  })


  it("MusaicPcsOp test sort", () => {
    let opCM7_T5 = new MusaicOperation(12, 7, 5, true);
    let opM1_T0 = new MusaicOperation(12, 1, 0, false);
    let opM1_T3 = new MusaicOperation(12, 1, 3, false);
    let opM1_T11 = new MusaicOperation(12, 1, 11, false);
    let opM7_T5 = new MusaicOperation(12, 7, 5, false);

    let ops = [opCM7_T5, opM1_T3, opM1_T0, opM7_T5, opM1_T11]

    let opsSortedWaiting = [opM1_T0, opM1_T3, opM1_T11, opM7_T5, opCM7_T5]

    expect(ops).not.toEqual(opsSortedWaiting)

    ops.sort(MusaicOperation.compare)

    expect(ops).toEqual(opsSortedWaiting)
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
    let left : MusaicOperation  = opM8_T2.compose(opM5_T11.compose(opM4_T3))
    let right : MusaicOperation = opM8_T2.compose(opM5_T11).compose(opM4_T3)
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
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    const op = groupCyclic.operations[2]

    expect(op.toString()).toEqual('M1-T2')
    expect(op.getFixedPcs().length).toEqual(4)

    // fixed pcs :
    // '[]'
    // '[0,2,4,6,8,10]'
    // '[1,3,5,7,9,11]'
    // '[0,1,2,3,4,5,6,7,8,9,10,11]'

    const ipcs : IPcs = op.getFixedPcs()[3]

    expect(ipcs.getPcsStr()).toEqual('[0 1 2 3 4 5 6 7 8 9 10 11]')
  })

  it('convertReprStringOfMusaicOperationsToArrayOfMusaicOperations', () =>{
    //["M1-T0", "CM5-T5"]
    const opM1T0 = new MusaicOperation(12,1,0,false)
    const opM11T9 = new MusaicOperation(12,11,9,false)
    const opCM5T5 = new MusaicOperation(12,5,5,true)
    let names = ["M1-T0", "M11-T9"]
    let opsWaiting = [opM1T0, opM11T9]
    let ops = MusaicOperation.convertArrayStringsToArrayOfMusaicOperations(12,names)

    expect(opsWaiting).toEqual(ops)

    names = ["M1-T0", "CM5-T5"]
    opsWaiting = [opM1T0, opCM5T5]
    ops = MusaicOperation.convertArrayStringsToArrayOfMusaicOperations(12,names)
    expect(opsWaiting).toEqual(ops)

  })

})
