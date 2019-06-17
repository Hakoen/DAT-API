import { CandidateObject, FaceObject } from "./httpModels";

function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

function compareCandidateObjects( a: CandidateObject, b: CandidateObject ) {
  if ( a.confidence < b.confidence ){
    return -1;
  }
  if ( a.confidence > b.confidence ){
    return 1;
  }
  return 0;
}

function compareFaceObjects( a: FaceObject, b: FaceObject ) {
  if ( a.candidates[0].confidence < b.candidates[0].confidence ){
    return -1;
  }
  if ( a.candidates[0].confidence > b.candidates[0].confidence ){
    return 1;
  }
  return 0;
}

export { getRandomArbitrary, toTitleCase, compareCandidateObjects, compareFaceObjects }
