import { Response } from 'express';

export const unauthorized = (res: Response) => {
    res.status(401).json({ auth: 'fail' });
};

export const endSession = (res: Response) => {
    res.status(401).json({ session: 'fail' });
};

export const notAllowed = (res: Response) => {
    res.status(401).json({ notAllowed: true });
};

export const savedFailed = (res: Response) => {
    res.status(500).json({ database: 'fail' });
};