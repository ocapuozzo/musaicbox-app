import {IPcs} from "../core/IPcs";
import {ScoreDrawingAbcNotation} from "./ScoreDrawingAbcNotation";

describe('ScoreDrawingAbcNotation', () => {

  /**
   * Test 12 seventh chords. Each is special
   */
  it('7 chords', () => {
    // C7
    let pcs7 = new IPcs({strPcs: "0, 4, 7, 10"})
    let abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("C E G _B 'c")

    // C#7 or Db7
    // C#7 : ^C ^E ^G _C  (we avoid _x when natural y exists.  E# -> F, Cb -> B)
    // so waiting C#7 = ^C F ^G B or Db7 : _D F _A _C, so _D F _A B (no top anymore)
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("_D F _A B '_d")

    // D7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("D ^F A C' 'd")

    // Eb7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("_E G _B _D' '_e")

    // E7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("E ^G B D' 'e")

    // F7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("F A C' _E' 'f")

    // F#7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("^F ^A ^C' E' '^f")

    // G7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("G B D' F' 'g")

    // Ab7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("_A C' _E' _G' '_a")

    // A7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("A ^C' E' G' 'a")

    // Bb7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("_B D' F' _A' '_b")

    // B7
    pcs7 = pcs7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcs7)
    expect(abcNotation).toEqual("B ^D' ^F' A' 'b")
  })

  /**
   * Test 12 minor seventh chords. Each is special
   */
  it('minor 7 chords', () => {
    // Cm7
    let pcsMinor7 = new IPcs({strPcs: "0, 3, 7, 10"})
    let abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("C _E G _B 'c")

    // C#m7 or Dbm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("^C E ^G B '^c")

    // Dm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("D F A C' 'd")

    // D#m7 or Ebm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("^D ^F ^A ^C' '^d")

    // Em7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("E G B D' 'e")

    // Fm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("F _A C' _E' 'f")

    // F#m7 or Gbm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("^F A ^C' E' '^f")

    // Gm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("G _B D' F' 'g")

    // G#m7 or Abm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("_A B _E' _G' '_a")

    // Am7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("A C' E' G' 'a")

    // A#m7 or Bbmin7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("_B _D' F' _A' '_b") // or ^A ^C' F' ^G'

    // Bm7
    pcsMinor7 = pcsMinor7.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsMinor7)
    expect(abcNotation).toEqual("B D' ^F' A' 'b")

  })

  it('dim chords', () => {
    // Cdim
    let pcsDim = new IPcs({strPcs: "0, 3, 6"})
    let abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsDim)
    expect(abcNotation).toEqual("C _E _G 'c")

    pcsDim = new IPcs({strPcs: "2, 5, 8"})
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsDim)
    expect(abcNotation).toEqual("D F _A 'd")

    pcsDim = new IPcs({strPcs: "2, 5, 8, 0"})
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsDim)
    expect(abcNotation).toEqual("D F _A C' 'd")

    pcsDim = new IPcs({strPcs: "2, 5, 8, 11"})
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pcsDim)
    expect(abcNotation).toEqual("D F _A B 'd")

  })

  it('chromatic scales', () => {
    let pentatonicChromatic  = new IPcs({strPcs: "10,8,9,0,11"})
    let abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(pentatonicChromatic)
    expect(abcNotation).toEqual("^A B C' ^G' A' '^a")
  })

  it('mixolydian scales', () => {
    let mixolydian  = new IPcs({strPcs: "0,2,4,5,7,9,10"})
    let abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(mixolydian)
    expect(abcNotation).toEqual("C D E F G A _B 'c")

    mixolydian = mixolydian.transposition(1)
    abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(mixolydian)
    expect(abcNotation).toEqual("^C ^D F _G _A ^A B '^c")
  })


  it('BeMian 0,3,6,7  scales', () => {
    let beMian = new IPcs({strPcs: "0,3,6,7"})
    let abcNotation = ScoreDrawingAbcNotation.fromPcsToABCNotation(beMian)
    expect(abcNotation).toEqual("C _E ^F G 'c")
  })



})
