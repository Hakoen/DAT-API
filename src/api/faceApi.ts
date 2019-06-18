import Axios, { AxiosInstance, AxiosResponse } from 'axios'
import { config } from 'dotenv'
import Path from 'path'
import { compareCandidateObjects } from '../helpers'
import {
  DetectResponse,
  ErrorResponse,
  FaceId,
  FaceObject,
  IdentifyResponse,
  PersistedFaceResponse,
  PersonCreateResponse,
  PersonFaceRecord,
  PersonId
} from '../httpModels'

config({ path: Path.resolve(__dirname, '..', '..', '.env') })

export class FaceApi {
  public static async createUser(
    pictureUrls: string[],
    name: string
  ): Promise<PersonId> {
    console.log(`createUser <pictureUrls: ${pictureUrls}, name: ${name}>`)
    const personId = await this.createPersonGroupPerson(name)

    const persistedFaces: FaceId[] = []

    for (const pictureUrl of pictureUrls) {
      const response = await this.instance.post<PersistedFaceResponse>(
        `${this.baseUrl}persongroups/${
          this.personGroupId
        }/persons/${personId}/persistedFaces`,
        { url: pictureUrl }
      )

      persistedFaces.push(response.data.persistedFaceId)
    }
    await this.instance.post(
      `${this.baseUrl}persongroups/${this.personGroupId}/train`
    )

    return personId
  }

  public static async detect(url: string): Promise<FaceId[]> {
    console.log(`detect <url: ${url}>`)
    const response = await this.instance.post<DetectResponse>(
      `${this.baseUrl}detect?returnFaceId=true&returnFaceLandmarks=false`,
      { url }
    )

    return response.data
      .map((obj) => obj.faceId)
      .filter((value, index, self) => self.indexOf(value) === index)
  }

  public static async identify(faceIds: FaceId[]): Promise<PersonFaceRecord[]> {
    let response: AxiosResponse<IdentifyResponse>
    console.log(`identify <faceIds: ${faceIds}>`)
    try {
      response = await this.instance.post<IdentifyResponse>(
        `${this.baseUrl}identify`,
        {
          personGroupId: this.personGroupId,
          faceIds,
          maxNumOfCandidatesReturned: 1,
          confidenceThreshold: process.env.FACE_API_THRESHOLD
        }
      )
      console.log('response', response.data)
    } catch (e) {
      console.log(e.toString())
      console.log(`Something went wrong: ${e.message}`)
      return []
    }

    const potentialMatches = response.data

    const result: PersonFaceRecord[] = potentialMatches
      .map<PersonFaceRecord>((record: FaceObject) => {
        if (record.candidates.length === 0) {
          return { face: record.faceId, person: null }
        }

        return {
          face: record.faceId,
          person: record.candidates.sort(compareCandidateObjects)[0].personId
        }
      })
      .filter((record: PersonFaceRecord) => record.face !== null)

    return result
  }
  private static baseUrl: string =
    'https://westeurope.api.cognitive.microsoft.com/face/v1.0/'
  private static personGroupId: string = process.env.FACE_API_PERSON_GROUP

  private static instance: AxiosInstance = Axios.create({
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.FACE_API_KEY,
      'Content-Type': 'application/json'
    }
  })

  private static async createPersonGroupPerson(
    name: string
  ): Promise<PersonId> {
    console.log(`createPersonGroupPerson <name: ${name}>`)
    const response = await this.instance.post<PersonCreateResponse>(
      `${this.baseUrl}persongroups/${this.personGroupId}/persons`,
      {
        name
      }
    )

    return response.data.personId
  }
}
