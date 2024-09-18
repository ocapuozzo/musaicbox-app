import {Forte} from "./Forte";
import {IPcs} from "./IPcs";

/**
 * @link https://en.wikipedia.org/wiki/List_of_set_classes
 */

describe('Forte num', () => {

  it("First num", () => {
    const emptyPcs = new IPcs({strPcs:''})
    const onePcs = new IPcs({strPcs:'[0]'})
    expect(Forte.forteNum(emptyPcs)).toEqual('0-1');
    expect(Forte.forteNum(onePcs)).toEqual('1-1');

    expect(emptyPcs.forteNum()).toEqual('0-1');
    expect(onePcs.forteNum()).toEqual('1-1');

  });

  it("Last num", () => {
    expect(Forte.forteNum(new IPcs({strPcs:'[0,1,2,4,5,7,8]'}))).toEqual('7-Z38');
  });

  it("Aeolian Harmonic IV", () => {
    expect(Forte.forteNum(new IPcs({strPcs:'0,3,4,6,7,9,11'}))).toEqual('7-32');
  });

})
