interface LoginRequestBody {
  picture_urls: string[]
  main_picture_url: string
}

type FaceId = string
type PersonId = string

interface PersonFaceRecord {
  person: PersonId
  face: FaceId
}

type DetectResponse = Array<{
  faceId: FaceId
  faceRectangle: {
    top: number
    left: number
    width: number
    height: number
  }
}>

type IdentifyResponse = FaceObject[]

interface FaceObject {
  faceId: FaceId
  candidates: CandidateObject[]
}

interface CandidateObject {
  personId: PersonId
  confidence: number
}

interface PersonCreateResponse {
  personId: PersonId
}

interface PersistedFaceResponse {
  persistedFaceId: FaceId
}

interface ErrorResponse {
  error: {
    code: string,
    message: string
  }
}

// tslint:disable-next-line: max-line-length
export {
  DetectResponse,
  IdentifyResponse,
  PersonCreateResponse,
  FaceObject,
  CandidateObject,
  FaceId,
  PersonId,
  PersonFaceRecord,
  PersistedFaceResponse,
  ErrorResponse
}
