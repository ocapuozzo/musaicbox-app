import {ArrayUtil} from "./ArrayUtil";

describe('Test for ArrayUtil', () => {

  it('compareTwoSortedArrays', () => {
    const arr1 = [1, 3, 5]
    const arr2 = [1, 3, 5]
    expect(ArrayUtil.compareTwoSortedArrays(arr1,arr2)).toBeTrue()
    const arr3 = [1, 3, 4]
    expect(ArrayUtil.compareTwoSortedArrays(arr1,arr3)).toBeFalse()
  })

  it('isIncludeIn', () => {
    const arr1 = [1, 3, 5]
    const arr2 = [1, 3, 5]
    expect(ArrayUtil.isIncludeIn(arr1,arr2)).toBeTrue()
    const arr3 = [1, 3, 4]
    expect(ArrayUtil.isIncludeIn(arr1,arr3)).toBeFalse()
    const arr4 = [1, 3, 4, 5]
    expect(ArrayUtil.isIncludeIn(arr1,arr4)).toBeTrue()
  })


})
