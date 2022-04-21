import { NextFunction, Response } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import appDir from './appDir';
import { endSession, unauthorized, unExistUser } from './errorRes';
import Coach from '../models/admin';

import Request from '../routing/interfaces/request_interfaces';


export const putUser = async (req: Request, res: Response, next: NextFunction) => {
    const { sid_ } = req.cookies;
    if (!sid_) {
        return unauthorized(res);
    }
    const sessionPath = join(appDir, 'session', 'sid_' + sid_ + '.json');
    const file = await readFile(sessionPath, 'utf8').then((res) => { return JSON.parse(res); }).catch((err) => { if (err) { return false; } });
    if (!file) {
        return endSession(res);
    }
    const user = await Coach.findOne({
        where: {
            id: file.userId
        },
        attributes: ['id', 'name', 'login', 'isAdmin']
    }).catch((err: any) => { if (err) { unExistUser(res); } });
    req.user = user;
    next();
};