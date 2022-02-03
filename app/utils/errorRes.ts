import { Response } from 'express';

export const badRequest = (res: Response, obj: { [key: string]: any; }) => {
    res.status(400).json(obj);
};

export const unauthorized = (res: Response) => {
    res.status(401).json({ auth: 'fail' });
};

export const endSession = (res: Response) => {
    res.status(401).json({ session: 'fail' });
};

export const notAllowed = (res: Response) => {
    res.status(403).json({ notAllowed: true });
};

export const notAcceptable = (res: Response, reason: string) => {
    res.status(406).json({ reason });
};

export const savedFailed = (res: Response) => {
    res.status(500).json({ database: 'fail' });
};

export const databaseFailed = (res: Response) => {
    res.status(500).json({ readWrite: 'fail' });
};

export const unExistUser = (res: Response) => {
    res.status(401).json({ unExistUser: 'true' });
};