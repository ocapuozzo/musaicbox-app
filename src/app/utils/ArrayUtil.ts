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

  static objectsEqual = (o1:any, o2:any) =>
    Object.keys(o1).length === Object.keys(o2).length
    && Object.keys(o1).every(p => o1[p] === o2[p]);

}
