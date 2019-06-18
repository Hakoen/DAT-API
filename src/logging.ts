import 'colors'
import { Request, Response } from 'express-serve-static-core'

const pad = (source: string) =>
  `${source.toUpperCase()}${'.'.repeat(12 - source.length)}`

const stringify = (source: any) =>
  source instanceof Object ? JSON.stringify(source) : source

const log = (type: string, message: string) =>
  console.log(`${pad(`${type}:`)}${message}`)

export const logConfig = (message: string) => {
  return log('CONFIG', message.yellow)
}
export const logRequest = (name: string, request: Request) => {
  return log(
    'REQUEST',
    `/${name} <body: ${JSON.stringify(request.body)}>`.white.bgBlack
  )
}
export const logFunctionCall = (functionName: string, args: object) => {
  return log('FUNCTION', `${functionName} <args: ${JSON.stringify(args)}>`.blue)
}
export const logMessage = (message: string) => {
  return log('MESSAGE', message)
}
export const logResult = <T>(result: T) => {
  return log('RESULT', `${stringify(result)}`.black.bgBlue)
}
export const logResponse = <T>(result: T, response: Response) => {
  return log(
    'RESPONSE',
    `<responseCode: ${response.statusCode}, result: ${stringify(result)}>`.black.bgGreen
  )
}
export const logError = (error: any) => {
  return log('ERROR', `${error}`.black.bgRed)
}
