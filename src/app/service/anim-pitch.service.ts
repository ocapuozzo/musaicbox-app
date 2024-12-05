import {EventEmitter, Injectable, Output} from '@angular/core';

export interface IPitchPlaying {
  indexPitchPlaying : number
  idPcs : number
}

@Injectable({
  providedIn: 'root'
})
export class AnimPitchService {

  @Output() eventNotePlaying = new EventEmitter<IPitchPlaying>();
  constructor() { }

  notePlaying(pitchPlaying: IPitchPlaying) {
    this.eventNotePlaying.emit(pitchPlaying)
  }
}
