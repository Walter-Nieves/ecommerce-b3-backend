import { Response } from 'express'
import dotenv from 'dotenv'
import { resError, responseToError, validateToken } from "../utils/validations"
import jwt from 'jsonwebtoken'
import { Role } from "../types/enums"
import { middleware } from "./types"

dotenv.config()
const SECRET = process.env.JWT_SECRET as string

export const authVerify: middleware<Response | undefined> = (req, res, next) => {
  try {
    const { accessToken } = req.cookies

    if (accessToken == null) {
      return resError(401, 'Token not provided or sesion expired')
    }

    const payload = validateToken(accessToken)
    res.locals.usuario = payload

    next()
  } catch (error) {
    return responseToError(error as Error, res)
  }
}

export const authRole: middleware<Response | undefined> = (req, res, next) => {
  try {
    const { accessToken } = req.cookies

    if (accessToken == null) {
      res.locals.usuario = { rol: Role.Buyer }
      next()
      return
    }

    try {
      res.locals.usuario = jwt.verify(accessToken, SECRET)
      next()
    } catch (error) {
      return resError(401, 'Token invalid or expired')
    }
  } catch (error) {
    return responseToError(error as Error, res)
  }
}