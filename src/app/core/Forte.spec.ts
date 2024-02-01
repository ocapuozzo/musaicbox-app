import {Forte} from "./Forte";
import {IPcs} from "./IPcs";

/**
 * @link https://en.wikipedia.org/wiki/List_of_set_classes
 */

describe('Forte num', () => {

  it("First num", () => {
    expect(Forte.forte('[]')).toEqual('0-1');
  });

  it("Last num", () => {
    expect(Forte.forte('[0,1,2,4,5,7,8]')).toEqual('7-Z38');
  });

})
