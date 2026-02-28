import { NextFunction, Request, Response } from "express";

export type middleware<Retorno> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Retorno;
