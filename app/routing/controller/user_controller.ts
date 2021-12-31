import { NextFunction, Response } from 'express';
import Request from '../../utils/interfaces';
const { validationResult } = require('express-validator');
import Coache from '../../models/admin';


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
        this.res.json({ nick: login, name });
    }

    getListOfUsers() {
        this.res.json({ status: 'ok' });
    }

}