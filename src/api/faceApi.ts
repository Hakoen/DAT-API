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
import { logFunctionCall, logResult, logError } from '../logging'

config({ path: Path.resolve(__dirname, '..', '..', '.env') })

export class FaceApi {
  public static async createUser(
    pictureUrls: string[],
    name: string
  ): Promise<PersonId> {
    logFunctionCall('FaceApi.createUser', { pictureUrls, name })

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

    logResult(personId)
    return personId
  }

  public static async detect(url: string): Promise<FaceId[]> {
    logFunctionCall('FaceApi.detect', { url })

    const response = await this.instance.post<DetectResponse>(
      `${this.baseUrl}detect?returnFaceId=true&returnFaceLandmarks=false`,
      { url }
    )

    const result = response.data
      .map((obj) => obj.faceId)
      .filter((value, index, self) => self.indexOf(value) === index)

    logResult(result)
    return result
  }

  public static async identify(faceIds: FaceId[]): Promise<PersonFaceRecord[]> {
    logFunctionCall('FaceApi.identify', { faceIds })

    let response: AxiosResponse<IdentifyResponse>
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
    } catch (e) {
      logError(e)
      const result: PersonFaceRecord[] = []
      logResult(result)
      return result
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
      .filter((record: PersonFaceRecord) => record.person !== null)

    logResult(result)
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
    logFunctionCall('FaceApi.createPersonGroupPerson', { name })
    const response = await this.instance.post<PersonCreateResponse>(
      `${this.baseUrl}persongroups/${this.personGroupId}/persons`,
      {
        name
      }
    )

    const result = response.data.personId
    logResult(result)
    return result
  }
}
