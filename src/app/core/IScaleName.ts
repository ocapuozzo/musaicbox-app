export interface IScaleNameOld {
  "is": string,
  "name": string,
  "pcs": string,
  "id88": number,
  "sources": [ string ]
}

export interface IScaleName {
  "is": string,
  "pcs": string,
  "id88": number,
  "sources": INameDefLink[]
}

export interface INameDefLink {
  "name": string,
  "url": string,
  "type": string
}
