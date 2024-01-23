import {MusaicPcsOperation} from "./MusaicPcsOperation";
import {IPcs} from "./IPcs";
describe('MusaicPcsOperation', () => {

  it("MusaicPcsOp testEqualsObject ", () => {
    let op1 = new MusaicPcsOperation(12, 7, 5, true);
    let op2 = new MusaicPcsOperation(12, 7, 5, true);
    expect(op1.equals(op2)).toEqual(true);
    op2 = new MusaicPcsOperation(12, 7, 5, false);
    expect(op1.equals(op2)).not.toBeTruthy();
    op1 = new MusaicPcsOperation(12, 7, 5, false)
    expect(op1.equals(op2)).toBeTruthy();
  });

  it("MusaicPcsOp compose", () => {
    let opCM7_T5 = new MusaicPcsOperation(12, 7, 5, true);
    let opCM7 = new MusaicPcsOperation(12, 7, 0, true);
    let opT5 = new MusaicPcsOperation(12, 1, 5, false);

    // action CM7 first and T5 second
    expect(opCM7_T5.equals(opT5.compose(opCM7))).toBeTruthy();
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

    // No commutative
    // action M4-T3 first and M5-T11 second => opM8-T2
    expect(opM8_T2.equals(opM5_T11.compose(opM4_T3))).toBeTruthy();
    // action M5-T11 first and M4-T3 second => opM8-T11
    expect(opM8_T11.equals(opM4_T3.compose(opM5_T11))).toBeTruthy();

    // associative ?  f . (g . h) = (f . g) . h
    let right = opM8_T2.compose(opM5_T11.compose(opM4_T3))
    let left = opM8_T2.compose(opM5_T11).compose(opM4_T3)
    expect(right).toEqual(left)
    // ok TODO others test
  })

})
