import { NextFunction, Request, Response } from 'express';
const { validationResult } = require('express-validator');

import Coach from '../../models/admin';
import { comparePasswords } from '../../utils/bcrypt';
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

    private unauthorized() {
        this.res.status(401).json({ auth: 'fail' });
    }

    private endSession() {
        this.res.status(401).json({ session: 'fail' });
    }

    private savedFailed() {
        this.res.status(500).json({ database: 'fail' });
    }

    async login() {
        const { nick, password } = this.req.body;
        const { sid_ } = this.req.cookies;
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
            return this.savedFailed();
        }
        createSessionCookie(id, this.res);
        return this.res.json({ isLogin: true, isAdmin: user.isAdmin, user: user.name });

    }

    async isLogin() {
        const { sid_ } = this.req.cookies;
        if (!sid_) {
            return this.endSession();
        }
        const result = await checkSessionFile(sid_);
        if (!result.isLogin) {
            return this.endSession();
        }
        return this.res.json({ isLogin: result.isLogin, isAdmin: result.isAdmin, user: result.name });

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