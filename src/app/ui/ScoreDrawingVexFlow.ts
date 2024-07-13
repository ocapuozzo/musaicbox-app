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

/*

import {UIPcsDto} from "./UIPcsDto";

import {Formatter, Renderer, Stave, StaveNote, Voice} from "vexflow";

export class ScoreDrawingVexFlow {
  static lettersSharpedNotation: string[] = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
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

  getStave(leftPadding : number) : Stave {
    // Create a stave of width 400 at position 10, 40 on the canvas.
    const stave = new Stave(leftPadding, 0, this.pcsDto.width + 40);
    // Add a clef
    stave.addClef('treble'); //.addTimeSignature('4/4');
    return stave
  }

  // for test bad responsive...
  getVoices() : Voice[] {
    let notes : StaveNote[] = []
    for (let i = 0; i < this.pcsDto.pcs.cardinal; i++) {
      notes.push(new StaveNote({ keys: ['c/4'],
        duration: '4'
      }))
    }
    // const notes = [
    //   new StaveNote({
    //     keys: ['c/4'],
    //     duration: '4'
    //   }),
    //   new StaveNote({
    //     keys: ['d/4'],
    //     duration: '4'
    //   }),
    //   new StaveNote({
    //     keys: ['d/4'],
    //     duration: '4'
    //   }),
    //   new StaveNote({
    //     keys: ['b/4'],
    //     duration: '4'
    //   }),
    //   new StaveNote({
    //     keys: ['g/4'],
    //     duration: '4'
    //   }),
    // ];

    return [
      new Voice({
         num_beats: this.pcsDto.pcs.cardinal,
         beat_value: 4
       }).addTickables(notes)]
  }

  drawScore() {
    const div = document.getElementById("paper-" + this.randomId) as HTMLDivElement
    if (div instanceof HTMLDivElement) {

      let w = this.pcsDto.width
      let leftPadding = 0
      let scale = 1

      if (w >= 220)  {
        scale = .84
      } else if (w >= 208) {
        scale = .83
      } else if (w >= 195) {
        scale = .82
      } else if (w >= 195) {
        scale = .82
      } else if (w >= 195) {
        scale = .82
      } else if (w >= 182) {
        scale = .81
      } else if (w >= 169) {
        scale = .8
      } else if (w >= 156) {
        scale = .79
      } else if (w >= 143) {
        scale = .78
      } else if (w >= 130) {
        scale = .75
      } else if (w >= 117) {
        scale = .74
      } else if (w >= 104) {
        scale = .7
      } else if (w >= 91) {
        scale = .62
        leftPadding = 7
      } else if (w >= 78) {
        scale = .54
        leftPadding = 12
      } else if (w >= 65) {
        scale = .45
        leftPadding = 14
      } else if (w >= 52) {
        scale = .35
        leftPadding = 18
      } else if (w >= 39) {
        scale = .25
        leftPadding = 22
      } else {
        scale = .2
      }

      const renderer = new Renderer(div, Renderer.Backends.SVG);
      // Configure the rendering context.

      renderer.resize(this.pcsDto.width, this.pcsDto.height) //this.pcsDto.height);
      // renderer.resize(200, 200);

      const context = renderer.getContext();

      let stave = this.getStave(leftPadding)

      // Connect stave to the rendering context and draw!
      stave.setContext(context)
      context.scale(scale,scale)

      console.log("scale = ", scale)
      console.log("this.pcsDto.width = ", this.pcsDto.width)

      stave.draw();

      let voices = this.getVoices()

      // Format and justify the notes to x pixels.
      new Formatter().joinVoices(voices).format(voices, this.pcsDto.width-5 ,  {align_rests:false, auto_beam:true});

      // Render voices.
      voices[0].draw(context, stave);
    }
  }


}
*/
