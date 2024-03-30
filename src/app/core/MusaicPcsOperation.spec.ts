import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {IPcs} from "./IPcs";
import {GroupAction} from "./GroupAction";
import {Group} from "./Group";
describe('MusaicPcsOperation', () => {

  it("MusaicPcsOp testEqualsObject ", () => {
    let op1 = new MusaicPcsOperation(12, 7, 5, true);
    let op2 = new MusaicPcsOperation(12, 7, 5, true);
    expect(op1.equals(op2)).toEqual(true);
    op2 = new MusaicPcsOperation(12, 7, 5, false);
    expect(op1.equals(op2)).not.toBeTruthy();
    op1 = new MusaicPcsOperation(12, 7, 5, false)
    expect(op1.equals(op2)).toBeTruthy();
    expect(op1.equals(op1)).toBe(true)
    expect(op1.equals(null)).toBe(false)
    expect(op1.equals(42)).toBe(false)

    let op3 = new MusaicPcsOperation(12, 5, 5, true);
    expect(op1.equals(op3)).not.toBeTruthy();
    op3 = new MusaicPcsOperation(10, 5, 5, true);
    expect(op1.equals(op3)).not.toBeTruthy();

    op2 = new MusaicPcsOperation(12, 7, 5, true);
    op1 = new MusaicPcsOperation(12, 7, 0, true);
    expect(op1.equals(op2)).not.toBeTruthy(); // bad t

  });

  it("MusaicPcsOp compose", () => {
    let opCM7_T5 = new MusaicPcsOperation(12, 7, 5, true);
    let opCM7 = new MusaicPcsOperation(12, 7, 0, true);
    let opT5 = new MusaicPcsOperation(12, 1, 5, false);

    // action CM7 first and T5 second
    expect(opCM7_T5.equals(opT5.compose(opCM7))).toBeTruthy();

    // n = 7
    const badT5 = new MusaicPcsOperation(7, 1, 5, true);
    try {
      expect(opCM7_T5.equals(badT5.compose(opCM7))).toBeTruthy();
      fail('Waiting exception because invalid n in operations')
    } catch (e: any) {
      expect(e.message).toContain("bad N in compose op")
    }
  });

  it("MusaicPcsOp testActionOn", () => {
    let pcs = new IPcs({strPcs: "0,3,4,7,8,11"});
    let opCM7_T5 = new MusaicPcsOperation(12, 7, 5, true);
    // n = 12, CM7_T5 is stabilizer for Pcs("0,3,4,7,8,11")

    let newPcs = opCM7_T5.actionOn(pcs)

    expect(pcs.equalsPcs(newPcs)).toBeTruthy();

    let opCM7 = new MusaicPcsOperation(12, 7, 0, true);
    let opT5 = new MusaicPcsOperation(12, 1, 5, false);
    expect(pcs.equalsPcs(opT5.actionOn(opCM7.actionOn(pcs)))).toBeTruthy();
  });

  it("MusaicPcsOp test sort", () => {
    let opCM7_T5 = new MusaicPcsOperation(12, 7, 5, true);
    let opM1_T0 = new MusaicPcsOperation(12, 1, 0, false);
    let opM1_T3 = new MusaicPcsOperation(12, 1, 3, false);
    let opM1_T11 = new MusaicPcsOperation(12, 1, 11, false);
    let opM7_T5 = new MusaicPcsOperation(12, 7, 5, false);

    let ops = [opCM7_T5, opM1_T3, opM1_T0, opM7_T5, opM1_T11]

    let opsSortedWaiting = [opM1_T0, opM1_T3, opM1_T11, opM7_T5, opCM7_T5]

    expect(ops).not.toEqual(opsSortedWaiting)

    ops.sort(MusaicPcsOperation.compare)

    expect(ops).toEqual(opsSortedWaiting)
  })

  it("no Commutative but Associative operation ", () => {
    let opM1_T2 = new MusaicPcsOperation(12, 1, 2, false);
    let opM1_T3 = new MusaicPcsOperation(12, 1, 3, false);
    let opM1_T11 = new MusaicPcsOperation(12, 1, 11, false);

    // no multiplication => commutative
    // action T3 first and T11 second
    expect(opM1_T2.equals(opM1_T11.compose(opM1_T3))).toBeTruthy();
    // action T11 first and T3 second
    expect(opM1_T2.equals(opM1_T3.compose(opM1_T11))).toBeTruthy();

    let opM8_T2 = new MusaicPcsOperation(12, 8, 2, false);
    let opM4_T3 = new MusaicPcsOperation(12, 4, 3, false);
    let opM5_T11 = new MusaicPcsOperation(12, 5, 11, false);
    let opM8_T11 = new MusaicPcsOperation(12, 8, 11, false);

    // associative ?  f . (g . h) = (f . g) . h
    let left = opM8_T2.compose(opM5_T11.compose(opM4_T3))
    let right = opM8_T2.compose(opM5_T11).compose(opM4_T3)
    expect(right.getHashCode()).toEqual(left.getHashCode())

    // commutative if t=0 (no translation)
    let opM7_T0 = new MusaicPcsOperation(12, 7, 0, false);
    let opM5_T0 = new MusaicPcsOperation(12, 5, 0, false);
    const op1 = opM7_T0.compose(opM5_T0)
    const op2 = opM5_T0.compose(opM7_T0)
    expect(op1.getHashCode()).toEqual(op2.getHashCode())

    // No commutative
    // action  M5-T11 ° M4-T3   => opM8-T2
    expect(opM8_T2.getHashCode()).toEqual(opM5_T11.compose(opM4_T3).getHashCode())
    // action  M4-T3  ° M5-T11  <> M5-T11 ° M4-T3
    expect(opM8_T2.getHashCode()).not.toEqual(opM4_T3.compose(opM5_T11).getHashCode())
    // action  M4-T3  ° M5-T11 => opM8-T11 (not opM8-T2)
    expect(opM8_T11.getHashCode()).toEqual(opM4_T3.compose(opM5_T11).getHashCode())

    // ok TODO others test
  })

  it('getFixedPcs', () => {
    const groupCyclic = GroupAction.predefinedGroupsActions(12, Group.CYCLIC)
    const op = groupCyclic.operations[2]

    expect(op.toString()).toEqual('M1-T2')
    expect(op.getFixedPcs().length).toEqual(4)

    // fixed pcsList :
    // '[]'
    // '[0,2,4,6,8,10]'
    // '[1,3,5,7,9,11]'
    // '[0,1,2,3,4,5,6,7,8,9,10,11]'

    const ipcs : IPcs = op.getFixedPcs()[3]

    expect(ipcs.getPcsStr()).toEqual('[0,1,2,3,4,5,6,7,8,9,10,11]')
  })

})
