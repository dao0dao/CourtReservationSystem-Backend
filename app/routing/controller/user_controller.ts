import { NextFunction, Response } from 'express';
import Request, { ProfileError } from '../../utils/interfaces';
const { validationResult } = require('express-validator');
import { badRequest, databaseFailed, notAllowed, unauthorized } from '../../utils/errorRes';
import Coach from '../../models/admin';
import { creatPassword } from '../../utils/bcrypt';



export default class User {
    private req: Request;
    private res: Response;
    private next: NextFunction;
    private errors: any;
    constructor(req: Request, res: Response, next: NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.errors = validationResult(this.req);
    }


    getUser() {
        const { name, login } = this.req.user;
        this.res.json({ login: login, name });
    }

    getListOfUsers() {
        this.res.json({ status: 'ok' });
    }

    async updateUser() {
        const { name, login, newPassword, confirmNewPassword } = this.req.body;
        const userId = this.req.user.id;
        const errObj: ProfileError = {};
        this.errors.errors.map((err: any) => {
            errObj[err.param] === false ? null : errObj[err.param] = false;
        });
        if (!this.errors.isEmpty() && (newPassword || confirmNewPassword)) {
            return badRequest(this.res, errObj);
        } else if (errObj['login'] === false || errObj['name'] === false) {
            const smallErrObj: Object = {
                login: (errObj['login'] === false ? errObj['login'] : null),
                name: (errObj['name'] === false ? errObj['name'] : null)
            };
            return badRequest(this.res, smallErrObj);
        }
        const user = await Coach.findOne({ where: { id: userId } }).catch(err => { if (err) { databaseFailed(this.res); } });
        if (user) {
            user.set({
                name,
                login
            });
            if (newPassword === confirmNewPassword && newPassword) {
                const password = await creatPassword(newPassword);
                user.set({
                    password
                });
            } else if (newPassword !== confirmNewPassword && newPassword) {
                return badRequest(this.res, { confirmNewPassword: false });
            }
            await user.save().catch(err => { if (err) { databaseFailed(this.res); } });
            return this.res.json({ name, login });
        } else {
            return notAllowed(this.res);
        }
    }

    async createUser() {
        const { name, login, password, confirmPassword } = this.req.body;
    }

}