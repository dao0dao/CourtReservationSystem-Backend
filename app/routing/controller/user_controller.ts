import { NextFunction, Response } from 'express';
import  { ProfileError } from '../interfaces/players_interfaces';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import { badRequest, databaseFailed, notAllowed } from '../../utils/errorRes';
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

    async getListOfUsers() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        const users = await Coach.findAll({ where: { isAdmin: false }, attributes: ['id', 'name', 'login'] }).catch(err => { console.log(err); if (err) { databaseFailed(err, this.res); } });
        this.res.json({ users });
    }

    private async functionUpdateUser(userId: string, name: string, login: string, newPassword: string, confirmNewPassword: string,) {
        const errObj: ProfileError = {};
        this.errors.errors.map((err: any) => {
            errObj[err.param] === false ? null : errObj[err.param] = false;
        });
        if (!this.errors.isEmpty() && (newPassword || confirmNewPassword)) {
            return badRequest(this.res, errObj);
        } else if (errObj['login'] === false || errObj['name'] === false || errObj['id'] === false) {
            const smallErrObj: Object = {
                id: (errObj['id'] === false ? errObj['id'] : null),
                login: (errObj['login'] === false ? errObj['login'] : null),
                name: (errObj['name'] === false ? errObj['name'] : null)
            };
            return badRequest(this.res, smallErrObj);
        }
        const user = await Coach.findOne({ where: { id: userId } }).catch(err => { if (err) { databaseFailed(err, this.res); } });
        if (user) {
            if (user.login !== login) {
                const reservedLogin = await Coach.findOne({ where: { login } }).catch(err => { if (err) { databaseFailed(err, this.res); } });
                if (reservedLogin) {
                    return this.res.status(400).json({ reservedLogin: true });
                } else {
                    user.set({ login });
                }
            }
            user.set({
                name
            });
            if (newPassword === confirmNewPassword && newPassword) {
                const password = await creatPassword(newPassword);
                user.set({
                    password
                });
            } else if (newPassword !== confirmNewPassword && newPassword) {
                return badRequest(this.res, { confirmNewPassword: false });
            }
            await user.save().catch(err => { if (err) { databaseFailed(err, this.res); } });
            return this.res.json({ name, login });
        } else {
            return notAllowed(this.res);
        }
    }

    async updateLoginUser() {
        const { name, login, newPassword, confirmNewPassword } = this.req.body;
        const userId = this.req.user.id;
        this.functionUpdateUser(userId, name, login, newPassword, confirmNewPassword);
    }

    async updateUser() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        const { id, name, login, newPassword, confirmNewPassword } = this.req.body;
        this.functionUpdateUser(id, name, login, newPassword, confirmNewPassword);
    }

    async createUser() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        const { name, login, password, confirmPassword } = this.req.body;
        const user = await Coach.findOne({ where: { login } }).catch(err => { if (err) { databaseFailed(err, this.res); } });
        if (user) {
            return this.res.status(400).json({ canNotCreateUser: true });
        }
        if (password != confirmPassword) {
            return this.res.status(400).json({ passwordDoesNotMatch: true });
        }
        const hashPass = await creatPassword(password);
        await Coach.create({
            name,
            login,
            password: hashPass
        });
        return this.res.json({ userCreate: true });
    }

    async deleteUser() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        if (!this.errors.isEmpty()) {
            return this.res.status(400).json({ id: false });
        }
        const id = this.req.params.id;
        const user = await Coach.findOne({ where: { id } }).catch(err => { if (err) { databaseFailed(err, this.res); } });
        await user.destroy().catch(err => { if (err) { databaseFailed(err, this.res); } });
        return this.res.json({ deletedUser: true });
    }

}