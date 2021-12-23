import { NextFunction, Request, Response } from 'express';
import { expiresDate } from './expiresDate';


export const createSessionCookie = (id: string, res: Response) => {

    const expires = expiresDate;
    return res.cookie('sid_', id, {
        httpOnly: true,
        expires,
        maxAge: 3600000,
        secure: false,
        path: '/'
    });
};