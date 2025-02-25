export class Mapping {

  /**
   * Define some currents auto mapping
   */
  static _preDefinedAutoMapping: Map<number, number[]> = new Map<number, number[]>()

  /**
   * Function call for create auto mapping on himself
   * Example of call (in constructor).
   *  <pre>
   *   this.templateMappingBinPcs = mapToHimSelf(this.abinPcs)
   *   if this.abinPcs = [1,0,0,1,0,0,0,1,0,0,1,0] // cm7 = [0,3,7,10]
   *   then this.templateMappingBinPcs will be : [0,1,2,3,4,5,6,7,8,9,10,11]
   *  </pre>
   * @param {number[]} binPcs a array bin pcs
   * @return {number[]} result.length == binPcs.length and elements of result are array index of binPcs
   */
  static mapToHimSelf = (binPcs: number[]): number[] => {
    return binPcs.map((value, index) => index)
  }

  static getAutoMapping(binArray: number[]): number[] {
    if (!Mapping._preDefinedAutoMapping.has(binArray.length)) {
      Mapping._preDefinedAutoMapping.set(binArray.length, Mapping.mapToHimSelf(binArray))
    }
    return Mapping._preDefinedAutoMapping.get(binArray.length)!
  }

}
