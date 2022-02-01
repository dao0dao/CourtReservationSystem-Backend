import { NextFunction, Response } from 'express';
import Request, { AddPlayer, AddPlayerError, Week } from '../../utils/interfaces';
import Players from '../../models/players';
import { badRequest, unauthorized } from '../../utils/errorRes';
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

    private fixErrors(errors: { errors: Array<any>; }): AddPlayerError {
        const error: AddPlayerError = {};
        errors.errors.forEach(el => {
            const er: string = el.param;
            error[er] = true;
        });
        return error;
    }

    private checkWeek(weeks: Week[]): boolean {

        if (!Array.isArray(weeks)) {
            return false;
        }
        if (!weeks.length) {
            return true;
        }
        for (let i = 0; i < weeks.length; i++) {
            const week = weeks[i];
            const weekKeys = Object.keys(week);
            if (weekKeys.length != 2) {
                return false;
            }
            for (let i = 0; i < weekKeys.length; i++) {
                //testuje klucze 'day' i 'time'
                const key = weekKeys[i];
                const regEx = /^(days|time){1}$/;
                if (!regEx.test(key)) {
                    return false;
                }
            }
            const dayKeys = Object.keys(week.days);
            let dayLength: number = dayKeys.length;
            if (dayLength > 7) {
                return false;
            }
            for (let i = 0; i < dayKeys.length; i++) {
                //sprawdzam czy propercje to numery
                const regEx = /[0-6]/;
                const key = dayKeys[i];
                if (!regEx.test(key)) {
                    return false;
                }
                //sprawdzam czy wartości propercji to 'true'
                if (week.days[key] !== true) {
                    return false;
                }
            }
            const timeKeys = Object.keys(week.time);
            for (let i = 0; i < timeKeys.length; i++) {
                //testuje klucze 'to' i 'from'
                const key = timeKeys[i];
                const regEx = /^(from|to){1}$/;
                if (!regEx.test(key)) {
                    return false;
                }
                const timeRegEx = /^((\d{1,2}:\d{1,2})|null)$/;
                if (!timeRegEx.test(week.time[key]) && week.time[key].length) {
                    return false;
                }
            }

        }
        return true;
    };

    addPlayer() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            const errors = this.fixErrors(this.errors);
            return badRequest(this.res, errors);
        }
        const player: AddPlayer = this.req.body;
        const isValidWeek: boolean = this.checkWeek(player.weeks);
        console.log(isValidWeek);
        this.res.json({ status: 'ok' });
    }
}