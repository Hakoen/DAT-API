interface LoginRequestBody {
  picture_urls: string[]
  main_picture_url: string
}

type DetectResponse = Array<{
  faceId: string
  faceRectangle: {
    top: number
    left: number
    width: number
    height: number
  }
}>

type IdentifyResponse = FaceObject[]

interface FaceObject {
  faceId: string
  candidates: CandidateObject[]
}

interface CandidateObject {
  personId: string
  confidence: number
}

interface PersonCreateResponse {
  personId: string
}

export { DetectResponse, IdentifyResponse, PersonCreateResponse, FaceObject, CandidateObject }
