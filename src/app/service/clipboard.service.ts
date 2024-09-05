import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService<T> {

  data: T

  constructor() { }

  copy(data : T) {
    this.data = data
  }

  paste() : T {
    return this.data
  }

  isEmpty() { return this.data === undefined }
}
