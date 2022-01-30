import { NextFunction, Response } from 'express';
import Request from '../../utils/interfaces';
import Players from '../../models/players';
import { unauthorized } from '../../utils/errorRes';
const { validationResult } = require('express-validator');


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



    addPlayer() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        console.log(this.errors);
        this.res.json({ status: 'ok' });
    }
}