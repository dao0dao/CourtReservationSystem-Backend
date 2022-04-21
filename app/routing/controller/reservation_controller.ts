import { NextFunction, Response } from 'express';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import ReservationModel from '../../models/reservation';
import { badRequest, databaseFailed, notAcceptable, notAllowed } from '../../utils/errorRes';
import { createReservationResponse, ReservationSQL } from '../interfaces/reservation_interfaces';

export default class Reservation {
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

    async getReservationsFromDate() { }

    async addReservation() {
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const reservation: ReservationSQL = this.req.body;
        const { timetable, form, payment, isPayed } = reservation;
        const { transformX, transformY, ceilHeight, zIndex } = timetable;
        const { date, timeFrom, timeTo, court, playerOne, playerTwo, guestOne, guestTwo } = form;
        const { hourCount } = payment;
        const createdReservation = await ReservationModel.create({
            transformX, transformY, ceilHeight, zIndex, date, timeFrom, timeTo, court, playerOne, playerTwo, guestOne, guestTwo, hourCount, isPayed
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        const response: createReservationResponse = {
            status: 'added',
            id: createdReservation.id
        };
        return this.res.json(response);
    }
}

