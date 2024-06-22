/**
 * Copyright (c) 2019. Olivier Capuozzo
 *
 * This file is part of the musaicbox project
 *
 * (c) Olivier Capuozzo <olivier.capuozzo@gmail.com>
 *
 * For the full copyright and license information, please view the README.md
 * file on git server.
 */

import {IPcs} from "../core/IPcs";
import {UIPcsDto} from "./UIPcsDto";
import {StringHash} from "../utils/StringHash";
import abcjs from "abcjs";

const PITCH_LINE_WIDTH = 4;

export class ScoreDrawing {
  static lettersNotation: string[] = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  pcsDto : UIPcsDto
  // ctx: CanvasRenderingContext2D
  randomId: string = ""

  constructor(
    x: {
      idElement ?: string
      pcsDto?: UIPcsDto
    } = {}) {
    if (!x.idElement) throw Error('Element Id waiting')
    this.randomId = x.idElement
    this.pcsDto = x.pcsDto ?? new UIPcsDto()
  }

  // TODO make pivot low pitch
  get tune(): string {
    if (!this.pcsDto.pcs) return "";

    let suffix = 'X:1\nL: 1/4\nK:C\n';
    let notes = '';
    let chord = '[ ';

    let pcs = this.pcsDto.pcs

    let n = pcs.getMappedBinPcs().length;

    const someNotesForChange = [1, 3, 6, 8, 10]

    let pcsN12 = this.pcsDto.pcs
    if (pcs.n != 12) {
      pcsN12 = new IPcs({binPcs: pcs.getMappedBinPcs()})
      pcsN12.setPivot(pcs.templateMappingBinPcs[pcs.getPivot() ?? 0])
    }
    // console.log("pcsN12 = ", pcsN12.getPcsStr())
    let prevNote = ''
    for (let i = pcsN12.iPivot ?? 0; i < n + (pcsN12.iPivot ?? 0); i++) {
      if (pcsN12.abinPcs[i % n] === 1) {
        let note = ScoreDrawing.lettersNotation[i % n];
        if (someNotesForChange.indexOf(i % n) !== -1) {
          // change # by b
          if (pcsN12.abinPcs[(i - 1) % n] === 1 &&
            pcsN12.abinPcs[(i + 1) % n] !== 1) {
            note = "_" + ScoreDrawing.lettersNotation[(i + 1) % n]
          }
        }
        // case third if #D and not E, then bE
        if (note == '^D') {
          if (pcsN12.abinPcs[4] === 0) {
            note = '_E'
          }
        } else if (note == '^A' && prevNote.includes("A")) {
          if (pcsN12.abinPcs[9] === 0) {
            note = '_B'
          }
        } else if (note == '^G' && prevNote.includes("G")) {
          if (pcsN12.abinPcs[8] === 1) {
            note = '_A'
          }
        } else if (note == 'B' && prevNote.includes("B")) {
          if (pcsN12.abinPcs[10] === 1 && pcsN12.abinPcs[0] === 0) {
            note = "_C'"
          }
        }
        // // console.log('note = ' + note +  'bin = ' + this.pcs.getMappedBinPcs())

        // TODO make pitches always up iPivot pitch
        // http://abcnotation.com/blog/2010/01/31/how-to-understand-abc-the-basics/
        if ((i % n) < (pcsN12.iPivot ?? 0)) {
          note += "'"
        }
        prevNote = note
        notes = notes + note;
        chord = chord + note;
      }
    }
    // TODO bad algo, I do hack for G# Major scales... it is hard to place 7 in 12...
    if (pcs.id === 32106) {
      notes = "^F^G^AB^C'^D'^E'"
    }
    chord = '' //(this.pcsList.cardinal < 5) ? chord + ' ]  \n' : '' // experimental
    notes = chord ? notes + '|' : notes

    // console.log("score text in score drawing : ", suffix + notes + chord)

    return suffix + notes + chord; //'C4 ^E4 G4 [C4E4G4]\n';
  }

  drawScore() {
    let len = this.pcsDto.width
    // https://configurator.abcjs.net/visual/
    console.log("width = ", len, "score = ", this.tune)
    let elt = document.getElementById('paper-'+this.randomId) as HTMLElement
    console.log('elt : ', 'paper-'+this.randomId,  elt)
    abcjs.renderAbc(
      "paper-" + this.randomId,
      this.tune,
      {
        //scale: .9,
        staffwidth: len,
        // paddingleft: 0,
        // paddingright: 10,
        paddingtop:20,
        responsive: "resize"
      });

  }
}
