import { NextFunction, Request, Response } from 'express';
const { validationResult } = require('express-validator');

import Coach from '../../models/admin';
import { comparePasswords } from '../../utils/bcrypt';
import { createSessionCookie } from '../../utils/handleCookies';
import { createSessionFile } from '../../utils/handleSession';
const uniqid = require('uniqid');


export default class Authorization {
    req: Request;
    res: Response;
    next: NextFunction;
    errors: any;
    constructor(req: Request, res: Response, next: NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.errors = validationResult(this.req);
    }

    private unauthorized() {
        this.res.status(401).json({ auth: 'fail' });
    }

    private savedFailed() {
        this.res.status(500).json({ database: 'fail' });
    }

    async login() {
        const { nick, password } = this.req.body;
        if (!this.errors.isEmpty()) {
            return this.unauthorized();
        }
        const user = await Coach.findOne({
            where: {
                login: nick
            }
        });
        if (!user) {
            return this.unauthorized();
        }
        const samePass = await comparePasswords(password, user.password);
        if (!samePass) {
            return this.unauthorized();
        }
        const id = uniqid();
        const isCreate = createSessionFile(id, user.id);
        if (!isCreate) {
            return this.savedFailed();
        }
        createSessionCookie(id, this.res);
        return this.res.json({ login: true });

    }

}