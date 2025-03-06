export class ArrayUtil{
  static compareTwoSortedArrays(arr1 : number[], arr2: number[]) {
    if (arr1.length !== arr2.length)
      return false;

    return arr1.every((element, index) => {
      return element === arr2[index]
    });
  }

 static isIncludeIn(arr: any[], into : any[]) : boolean {
    return arr.every(v => into.includes(v));
 }


 static shift(arr: any[], toLeft: boolean, n : number): any[] {
   for (let i = n; i > 0; --i) { (toLeft ? arr.unshift(arr.pop()) : arr.push(arr.shift())); }
   return arr;
  }

}
