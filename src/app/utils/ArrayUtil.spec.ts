import {ArrayUtil} from "./ArrayUtil";

describe('Test for ArrayUtil', () => {

  it('compareTwoSortedArrays', () => {
    const arr1 = [1, 3, 5]
    const arr2 = [1, 3, 5]
    expect(ArrayUtil.compareTwoSortedArrays(arr1,arr2)).toBeTrue()
    const arr3 = [1, 3, 4]
    expect(ArrayUtil.compareTwoSortedArrays(arr1,arr3)).toBeFalse()

    expect(ArrayUtil.objectsEqual(arr1,arr2)).toBeTrue()
    expect(ArrayUtil.objectsEqual(arr3,arr2)).toBeFalse()

  })

  it('objectsEqual', () => {
    const arr1 = [1, 3, 5]
    const arr2 = [1, 3, 5]
    const arr3 = [1, 3, 4]
    const arr3bis = [1, 3, 4, 5]

    expect(ArrayUtil.objectsEqual(arr1,arr2)).toBeTrue()
    expect(ArrayUtil.objectsEqual(arr3,arr2)).toBeFalse()
    expect(ArrayUtil.objectsEqual(arr3,arr3bis)).toBeFalse()

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

 it('shift' , () => {
   let arr1 = [1, 3, 5]
   expect(ArrayUtil.shift(arr1, false, 1)).toEqual([3,5,1])
   arr1 = [1, 3, 5]
   expect(ArrayUtil.shift(arr1, false, 2)).toEqual([5,1,3])
   arr1 = [1, 3, 5]
   expect(ArrayUtil.shift(arr1, true, 3)).toEqual([1,3,5])
   arr1 = [1, 3, 5]
   expect(ArrayUtil.shift(arr1, false, 3)).toEqual([1,3,5])
   arr1 = [1, 3, 5]
   expect(ArrayUtil.shift(arr1, true, 1)).toEqual([5,1,3])
 })

})
