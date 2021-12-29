import { NextFunction, Request, Response } from 'express';
const { validationResult } = require('express-validator');

import Coach from '../../models/admin';
import { comparePasswords } from '../../utils/bcrypt';
import { unauthorized, endSession, savedFailed } from '../../utils/errorRes';
import { createSessionCookie, removeSessionCookie } from '../../utils/handleCookies';
import { checkSessionFile, createSessionFile, extendSession, removeSession } from '../../utils/handleSession';
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

    async login() {
        const { nick, password } = this.req.body;
        const { sid_ } = this.req.cookies;
        if (!this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const user = await Coach.findOne({
            where: {
                login: nick
            }
        });
        if (!user) {
            return unauthorized(this.res);
        }
        const samePass = await comparePasswords(password, user.password);
        if (!samePass) {
            return unauthorized(this.res);
        }
        if (sid_) {
            const userId = await extendSession(sid_);
            if (userId === user.id) {
                createSessionCookie(sid_, this.res);
                return this.res.json({ isLogin: true, isAdmin: user.isAdmin, user: user.name });
            }
        }
        const id = uniqid();
        const isCreate = createSessionFile(id, user.id, user.isAdmin, user.name);
        if (!isCreate) {
            return savedFailed(this.res);
        }
        createSessionCookie(id, this.res);
        return this.res.json({ isLogin: true, isAdmin: user.isAdmin, user: user.name });

    }

    async isLogin() {
        const { sid_ } = this.req.cookies;
        if (!sid_) {
            return endSession(this.res);
        }
        const result = await checkSessionFile(sid_);
        if (!result.isLogin) {
            return endSession(this.res);
        }
        return this.res.json({ isLogin: result.isLogin, isAdmin: result.isAdmin, user: result.user });

    }

    async logout() {
        const { sid_ } = this.req.cookies;
        if (!sid_) {
            return this.res.status(200).json({ status: 'ok' });
        }
        await removeSession(sid_);
        removeSessionCookie(this.res);
        return this.res.status(200).json({ status: 'ok' });
    }

}