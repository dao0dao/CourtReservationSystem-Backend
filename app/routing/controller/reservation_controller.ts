import { NextFunction, Response } from 'express';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import ReservationModel from '../../models/reservation';
import Players from '../../models/players';
import Opponents from '../../models/opponents';
import { badRequest, databaseFailed, notAcceptable, notAllowed, unauthorized } from '../../utils/errorRes';
import { createReservationResponse, Reservation, ReservationSQL, UpdateReservationSQL } from '../interfaces/reservation_interfaces';
import { PlayerSQL, Player } from '../interfaces/players_interfaces';

export default class Timetable {
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

    /* Funkcje pomocnicze */

    private getToday(): string {
        const year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let monthString: string = '';
        if (month < 10) {
            monthString = '0' + month;
        } else {
            monthString = month.toString();
        }
        const day = new Date().getDate();
        return (year + '-' + monthString + '-' + day);
    }

    private async getAllPlayers(): Promise<Player[]> {
        const allPlayers: Player[] = [];
        const players: PlayerSQL[] = await Players.findAll({
            attributes: ['id', 'name', 'surname', 'telephone', 'email', 'court', 'stringsName', 'priceSummer', 'priceWinter', 'tension', 'balls', 'weeks', 'notes'],
            include: [
                { model: Opponents, attributes: [['opponentId', 'id']] }
            ]
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        players.forEach((pl: PlayerSQL) => {
            const { id, name, surname, telephone, email, court, stringsName, tension, balls, weeks, notes, account, priceSummer, priceWinter, opponents } = pl;
            const newPlayer: Player = {
                id, name, surname, telephone, email, court, stringsName, tension, balls, weeks, notes, account, priceSummer, priceWinter, opponents: []
            };
            opponents.forEach(el => {
                const op: PlayerSQL | undefined = players.find(p => (p.id === el.id));
                if (op) {
                    newPlayer.opponents.push({ id: op.id, name: op.name, surname: op.surname });
                }
            });
            allPlayers.push(newPlayer);
        });
        return allPlayers;
    }

    private async updateFields(input: UpdateReservationSQL): Promise<boolean> {
        const reservation = await ReservationModel.findOne({ where: { id: input.id } });
        if (reservation) {
            const { timetable, form, payment, isPayed } = input;
            timetable?.ceilHeight !== undefined ? reservation.set({ ceilHeight: timetable?.ceilHeight }) : null;
            timetable?.transformX !== undefined ? reservation.set({ transformX: timetable?.transformX }) : null;
            timetable?.transformY !== undefined ? reservation.set({ transformY: timetable?.transformY }) : null;
            timetable?.zIndex !== undefined ? reservation.set({ zIndex: timetable?.zIndex }) : null;

            form?.date !== undefined ? reservation.set({ date: form?.date }) : null;
            form?.timeFrom !== undefined ? reservation.set({ timeFrom: form?.timeFrom }) : null;
            form?.timeTo !== undefined ? reservation.set({ timeTo: form?.timeTo }) : null;
            form?.court !== undefined ? reservation.set({ court: form?.court }) : null;
            form?.playerOneId !== undefined ? reservation.set({ playerOneId: form?.playerOneId }) : null;
            form?.playerTwoId !== undefined ? reservation.set({ playerTwoId: form?.playerTwoId }) : null;
            form?.guestOne !== undefined ? reservation.set({ guestOne: form?.guestOne }) : null;
            form?.guestTwo !== undefined ? reservation.set({ guestTwo: form?.guestTwo }) : null;

            payment?.hourCount !== undefined ? reservation.set({ hourCount: payment?.hourCount }) : null;

            isPayed !== undefined ? reservation.set({ isPayed }) : null;

            await reservation.save().catch(err => { if (err) { return databaseFailed(this.res); } });
            return true;
        }
        return false;
    }

    /* Funkcje obsługujące zapytanie */

    async getReservationsFromDate() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return badRequest(this.res, { invalidDate: true });
        }
        const date = this.req.query.date;
        const allPlayers: Player[] = await this.getAllPlayers();
        const allReservations: Reservation[] = [];
        const reservationArr = await ReservationModel.findAll({
            where: {
                date
            },
            attributes: ['id', 'transformX', 'transformY', 'ceilHeight', 'zIndex', 'date', 'timeFrom', 'timeTo', 'court', 'playerOneId', 'playerTwoId', 'guestOne', 'guestTwo', 'hourCount', 'isPayed']
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        reservationArr.forEach(r => {
            const { id, transformX, transformY, ceilHeight, zIndex, date, timeFrom, timeTo, court, playerOneId, playerTwoId, guestOne, guestTwo, hourCount, isPayed } = r;
            let playerOne: Player | undefined;
            let playerTwo: Player | undefined;
            if (playerOneId) {
                playerOne = allPlayers.find(pl => pl.id == playerOneId);
            }
            if (playerTwoId) {
                playerTwo = allPlayers.find(pl => pl.id == playerTwoId);
            }
            const reservation: Reservation = {
                id,
                timetable: {
                    transformX, transformY, ceilHeight, zIndex
                },
                form: {
                    date, timeFrom, timeTo, court, playerOne, playerTwo, guestOne, guestTwo,
                },
                payment: {
                    hourCount
                },
                isPayed
            };
            allReservations.push(reservation);
        });
        this.res.json({ reservations: allReservations });
    }

    async addReservation() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const reservation: ReservationSQL = this.req.body;
        const { timetable, form, payment, isPayed } = reservation;
        const { transformX, transformY, ceilHeight, zIndex } = timetable;
        const { date, timeFrom, timeTo, court, playerOneId, playerTwoId, guestOne, guestTwo } = form;
        const { hourCount } = payment;

        const today: number = new Date(this.getToday()).getTime();
        const reservationDay: number = new Date(date).getTime();
        const dateSubtract: number = today - reservationDay;

        if (!this.req.user.isAdmin && dateSubtract > 0) {
            return notAcceptable(this.res, 'Brak uprawnień');
        }

        const createdReservation = await ReservationModel.create({
            transformX, transformY, ceilHeight, zIndex, date, timeFrom, timeTo, court, playerOneId, playerTwoId, guestOne, guestTwo, hourCount, isPayed
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        const response: createReservationResponse = {
            status: 'added',
            id: createdReservation.id
        };
        return this.res.json(response);
    }

    async updateReservation() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        const reservation: UpdateReservationSQL = this.req.body;
        const today: number = new Date(this.getToday()).getTime();
        const reservationDay: number = new Date(reservation.form?.date).getTime();
        const dateSubtract: number = today - reservationDay;
        if (!this.req.user.isAdmin && dateSubtract > 0) {
            return notAcceptable(this.res, 'Brak uprawnień');
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane formularza');
        }
        if (reservation.form.timeFrom !== undefined) {
            if (reservation.form.timeFrom === '23:45' || parseFloat(reservation.form.timeFrom) >= 24 || parseFloat(reservation.form.timeFrom) < 0) {
                return notAcceptable(this.res, 'Nieprawidłowa godz. "od"');
            }
        }
        if (reservation.payment?.hourCount !== undefined) {
            if (reservation.payment?.hourCount < 0.5) {
                return notAcceptable(this.res, 'Min. czas gry 30 min.');
            }
        }
        const result = await this.updateFields(reservation);
        if (result) {
            return this.res.status(202).json({ updated: true });
        }
        return notAcceptable(this.res, 'Błędne dane');
    }
}

