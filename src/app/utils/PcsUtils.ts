import {MusaicOperation} from "../core/MusaicOperation";

export class PcsUtils{

  /**
   * Solves the equation ak' + k ≡ 0 (mod n) for k', where:
   * - `a` is an integer coprime with `n` (gcd(a, n) = 1),
   * - `k` is an integer in the range [0, n-1],
   * - `n` is an integer greater than 2.
   *
   * @param a - An integer in the range [1, n-1] that is coprime with `n`.
   * @param k - An integer in the range [0, n-1].
   * @param n - A positive integer greater than 2.
   * @returns The value of k' in the range [0, n-1] that solves the equation.
   * @throws Will throw an error if `a` is not coprime with `n`.
   */
   static solveEquationV1(a: number, k: number, n: number): number {
    /**
     * Computes the greatest common divisor (gcd) of two integers `a` and `b`
     * using the extended Euclidean algorithm. Returns the gcd along with
     * coefficients `x` and `y` such that:
     *     gcd(a, b) = a * x + b * y
     *
     * @param a - The first integer.
     * @param b - The second integer.
     * @returns An object containing:
     *          - `gcd`: The greatest common divisor of `a` and `b`.
     *          - `x`: The coefficient for `a` in the linear combination.
     *          - `y`: The coefficient for `b` in the linear combination.
     */
    function extendedGCD(a: number, b: number): { gcd: number, x: number, y: number } {
      if (b === 0) {
        return { gcd: a, x: 1, y: 0 }; // Base case: gcd(a, 0) = a
      }
      const { gcd, x: x1, y: y1 } = extendedGCD(b, a % b);

      return { gcd, x: y1, y: x1 - Math.floor(a / b) * y1 };
    }

    // Step 1: Compute the modular inverse of `a` modulo `n`
    const { gcd, x: aInverse } = extendedGCD(a, n);
    if (gcd !== 1) {
      throw new Error(`'a' must be coprime with 'n'. gcd(${a}, ${n}) = ${gcd}`);
    }

    // Ensure the inverse is positive
    const modInverse = (aInverse % n + n) % n;

    // Step 2: Solve for k' using the formula k' ≡ -k * a⁻¹ (mod n)
    return (-k * modInverse % n + n) % n; // Ensure the result is in [0, n-1]

  }


  /**
   * Solves the equation ak' + k ≡ 0 (mod n) for k', where:
   * - `a` is an integer coprime with `n` (gcd(a, n) = 1),
   * - `k` is an integer in the range [0, n-1],
   * - `n` is an integer greater than 2.

   *  if n = 12 assume that a is prime with it (no throws error)
   *
   * @param a - An integer in the range [1, n-1] that is coprime with `n`.
   * @param k - An integer in the range [0, n-1].
   * @param n - A positive integer greater than 2.
   * @returns The value of k' in the range [0, n-1] that solves the equation.
   * @throws Will throw an error if `a` is not coprime with `n`.
   */
  static solveEquation(a: number, k: number, n: number): number {
    if (n === 12) {
      return this.solveEquationV2(a, k, n)
    }
    return this.solveEquationV1(a, k, n)
  }

  // curiosity discovered in January 2025...
  static solveEquationV2(a: number, k: number, n: number): number {
      // works only if n in [2, 3, 4, 6, 8, 12]
      return n * Math.ceil(k * a / n) - (k * a)
  }

  /**
   * return inverse of this argument  (c,a,t) |-> (c,a,−t⋅a^(−1))
   * @param musOp - A musaic operation
   */
  static getInverse(musOp : MusaicOperation ) : MusaicOperation {
     return new MusaicOperation(musOp.n, musOp.a, this.solveEquation(musOp.a, musOp.t, musOp.n), musOp.complement)
  }

}
