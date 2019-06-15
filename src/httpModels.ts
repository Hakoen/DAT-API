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

type IdentifyResponse = Array<{
  faceId: string
  candidates: Array<{
    personId: string
    confidence: number
  }>
}>

interface PersonCreateResponse {
  personId: string
}

export { DetectResponse, IdentifyResponse, PersonCreateResponse }
