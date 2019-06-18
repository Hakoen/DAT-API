import { CandidateObject, FaceObject } from './httpModels'

function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

type Comparer<T> = (a: T, b: T) => number

const compareCandidateObjects: Comparer<CandidateObject> = (a, b) => {
  if (a.confidence < b.confidence) {
    return -1
  }
  if (a.confidence > b.confidence) {
    return 1
  }
  return 0
}

const compareFaceObjects: Comparer<FaceObject> = (a, b) => {
  if (a.candidates[0].confidence < b.candidates[0].confidence) {
    return -1
  }
  if (a.candidates[0].confidence > b.candidates[0].confidence) {
    return 1
  }
  return 0
}

export {
  getRandomArbitrary,
  toTitleCase,
  compareCandidateObjects,
  compareFaceObjects
}
