import { NextFunction, Response } from 'express';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import ReservationModel from '../../models/reservation';
import PaymentsHistoryModel from '../../models/paymentHistory';
import Opponents from '../../models/opponents';
import PlayersModel from '../../models/players';
import AccountModel from '../../models/account';
import { badRequest, databaseFailed, notAcceptable, notAllowed, unauthorized } from '../../utils/errorRes';
import { createReservationResponse, PlayerPayment, Reservation, ReservationDataBase, ReservationPayment, ReservationSQL, UpdateReservationSQL } from '../interfaces/reservation_interfaces';
import { PlayerSQL, Player, AccountSql } from '../interfaces/players_interfaces';
import { PaymentHistorySQL } from '../interfaces/history_interfaces';

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
    /* Functions handling requests */

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
            attributes: ['id', 'transformX', 'transformY', 'ceilHeight', 'zIndex', 'date', 'timeFrom', 'timeTo', 'court', 'playerOneId', 'playerTwoId', 'guestOne', 'guestTwo', 'hourCount', 'isPlayerOnePayed', 'isPlayerTwoPayed', 'isFirstPayment']
        }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        reservationArr.forEach(r => {
            const { id, transformX, transformY, ceilHeight, zIndex, date, timeFrom, timeTo, court, playerOneId, playerTwoId, guestOne, guestTwo, hourCount, isPlayerOnePayed, isPlayerTwoPayed, isFirstPayment } = r;
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
                isPlayerOnePayed,
                isPlayerTwoPayed,
                isFirstPayment: isFirstPayment
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
        const { timetable, form, payment, isPlayerOnePayed, isPlayerTwoPayed } = reservation;
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
            transformX, transformY, ceilHeight, zIndex, date, timeFrom, timeTo, court, playerOneId, playerTwoId, guestOne, guestTwo, hourCount, isPlayerOnePayed, isPlayerTwoPayed
        }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
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
        if (result.updated) {
            return this.res.status(202).json({ updated: true });
        }
        return notAcceptable(this.res, result.reason);
    }

    async deleteReservation() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        const reservation: ReservationDataBase = await ReservationModel.findOne({
            where: {
                id: this.req.params.id
            }
        }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        const today: number = new Date(this.getToday()).getTime();
        const reservationDay: number = new Date(reservation.date).getTime();
        const dateSubtract: number = today - reservationDay;
        if (!this.req.user.isAdmin && dateSubtract > 0) {
            return notAcceptable(this.res, 'Brak uprawnień');
        }
        if (reservation.isPlayerOnePayed || reservation.isPlayerTwoPayed) {
            await this.undoCharges(reservation);
        }
        await reservation.destroy().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        return this.res.status(202).json({ deleted: true });
    }

    async payForReservations() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }

        const data: ReservationPayment = this.req.body;
        const reservation: ReservationDataBase = await ReservationModel.findOne({ where: { id: data.reservationId } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        if (reservation.court == '3') {
            return notAcceptable(this.res, 'Brak opłat z rezerwowych');
        }
        const paymentHistory: PaymentHistorySQL[] = await PaymentsHistoryModel.findAll({ where: { gameId: reservation.id } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        const playerOne: PlayerSQL = await PlayersModel.findOne({ where: { id: data.playerOne?.id } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        let accountOneModel: AccountSql | undefined;
        if (playerOne) {
            accountOneModel = await AccountModel.findOne({ where: { playerId: playerOne.id } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        }
        const playerTwo: PlayerSQL = await PlayersModel.findOne({ where: { id: data.playerTwo?.id } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        let accountTwoModel: AccountSql | undefined;
        if (playerTwo) {
            accountTwoModel = await AccountModel.findOne({ where: { playerId: playerTwo.id } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        }
        const today: number = new Date(this.getToday()).getTime();
        const reservationDay: number = new Date(reservation.date).getTime();
        const dateSubtract: number = today - reservationDay;
        if (!this.req.user.isAdmin && dateSubtract > 0) {
            return notAcceptable(this.res, 'Brak uprawnień');
        }
        if (!reservation) {
            return notAcceptable(this.res, 'Brak rezerwacji w bazie danych');
        }
        if (paymentHistory.length === 0) {
            // Creating new payment
            if (data.playerOne?.name) {
                await this.createPaymentForPlayer(data.reservationId, data.playerOne, reservation, playerOne, accountOneModel, '1');
            };
            if (data.playerTwo?.name) {
                await this.createPaymentForPlayer(data.reservationId, data.playerTwo, reservation, playerTwo, accountTwoModel, '2');
            }
            return this.res.json({ payment: 'accepted' });
        } else {
            // Updating payment
            if (data.playerOne?.name) {
                await this.updatePaymentForPlayer(data.playerOne, reservation, playerOne, accountOneModel, '1', paymentHistory);
            }
            if (data.playerTwo?.name) {
                await this.updatePaymentForPlayer(data.playerTwo, reservation, playerTwo, accountTwoModel, '2', paymentHistory);
            }
            return this.res.json({ payment: 'updated' });
        }
    }

    /* Auxiliary functions */
    private async undoCharges(reservation: ReservationDataBase) {
        if (reservation.isPlayerOnePayed && reservation.playerOneId) {
            const historyModel: PaymentHistorySQL = await PaymentsHistoryModel.findOne({ where: { gameId: reservation.id, playerId: reservation.playerOneId } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            const accountBefore = historyModel.accountBefore;
            const accountModel: AccountSql = await AccountModel.findOne({ where: { playerId: reservation.playerOneId } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            accountModel.update({ account: accountBefore })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            accountModel.save()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await historyModel.destroy()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        } else if (reservation.isPlayerOnePayed && reservation.guestOne) {
            const historyModel: PaymentHistorySQL = await PaymentsHistoryModel.findOne({ where: { gameId: reservation.id, playerName: reservation.guestOne } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await historyModel.destroy()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        }
        if (reservation.isPlayerTwoPayed && reservation.playerTwoId) {
            const historyModel: PaymentHistorySQL = await PaymentsHistoryModel.findOne({ where: { gameId: reservation.id, playerId: reservation.playerTwoId } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            const accountBefore = historyModel.accountBefore;
            const accountModel: AccountSql = await AccountModel.findOne({ where: { playerId: reservation.playerTwoId } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            accountModel.update({ account: accountBefore })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            accountModel.save()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await historyModel.destroy()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        } else if (reservation.isPlayerTwoPayed && reservation.guestTwo) {
            const historyModel: PaymentHistorySQL = await PaymentsHistoryModel.findOne({ where: { gameId: reservation.id, playerName: reservation.guestTwo } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await historyModel.destroy()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        }
    }

    private async updatePaymentForPlayer(
        playerPayment: PlayerPayment,
        reservationModel: ReservationDataBase,
        playerModel: PlayerSQL,
        accountModel: AccountSql | undefined,
        playerNumber: '1' | '2',
        paymentHistory: PaymentHistorySQL[]
    ) {
        const isPayed = playerPayment.method === 'debet' ? false : true;
        if (playerModel && accountModel) {
            // Updating payment for player which is in base
            const playerHistoryModel: PaymentHistorySQL = paymentHistory.find(h => h.playerId === playerPayment.id)!;
            const accountBefore = playerHistoryModel.accountBefore;
            let accountAfter = accountBefore;
            if (playerPayment.method === 'payment') {
                accountAfter -= playerPayment.value;
            }
            accountModel.update({ account: accountAfter })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await accountModel.save()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await playerHistoryModel.update({
                paymentMethod: playerPayment.method,
                value: playerPayment.value,
                accountBefore: accountBefore,
                accountAfter: accountAfter,
                cashier: this.req.user.name,
                isPayed: isPayed,
            }).catch(err => { if (err) { console.log(err); return databaseFailed(err, this.res); } });
            await playerHistoryModel.save()
                .catch(err => { if (err) { console.log(err); return databaseFailed(err, this.res); } });
        } else {
            // Updating payment for player which is NOT in base
            const playerHistoryModel: PaymentHistorySQL = paymentHistory.find(h => h.playerName === playerPayment.name && !playerPayment.id)!;
            await playerHistoryModel.update({
                paymentMethod: playerPayment.method,
                value: playerPayment.value,
                accountBefore: 0,
                accountAfter: 0,
                cashier: this.req.user.name,
                isPayed: isPayed,
            }).catch(err => { if (err) { console.log(err); return databaseFailed(err, this.res); } });
            await playerHistoryModel.save()
                .catch(err => { if (err) { console.log(err); return databaseFailed(err, this.res); } });
        }
        if (playerNumber === '1') {
            reservationModel.set({ isPlayerOnePayed: isPayed });
        } else {
            reservationModel.set({ isPlayerTwoPayed: isPayed });
        }
        reservationModel.set({ isFirstPayment: true });
        await reservationModel.save()
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
    }


    private async createPaymentForPlayer(
        reservationId: string,
        playerPayment: PlayerPayment,
        reservationModel: ReservationDataBase,
        playerModel: PlayerSQL,
        accountModel: AccountSql | undefined,
        playerNumber: '1' | '2'
    ) {
        const isPayed = playerPayment.method === 'debet' ? false : true;
        const gameDate = new Date(reservationModel.date);
        if (playerModel && accountModel) {
            // Creating payment for player which is in base
            const accountBefore = accountModel.account;
            let accountAfter = accountModel?.account!;
            if (playerPayment.method === 'payment') {
                accountAfter -= playerPayment.value;
            }
            accountModel.update({ account: accountAfter })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });;
            await accountModel.save()
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            await PaymentsHistoryModel.create({
                paymentMethod: playerPayment.method,
                value: playerPayment.value,
                playerId: playerPayment.id,
                playerName: playerPayment.name,
                serviceName: playerPayment.serviceName,
                accountBefore: accountBefore,
                accountAfter: accountModel?.account,
                cashier: this.req.user.name,
                isPayed: isPayed,
                gameId: reservationId,
                createdAt: gameDate
            }).catch(err => { if (err) { console.log(err); return databaseFailed(err, this.res); } });
        } else {
            // Creating payment for player which is NOT in base
            await PaymentsHistoryModel.create({
                paymentMethod: playerPayment.method,
                value: playerPayment.value,
                playerId: '',
                playerName: playerPayment.name,
                serviceName: playerPayment.serviceName,
                accountBefore: 0,
                accountAfter: 0,
                cashier: this.req.user.name,
                isPayed: isPayed,
                gameId: reservationId,
                createdAt: gameDate
            }).catch(err => { if (err) { console.log(err); return databaseFailed(err, this.res); } });
        }
        if (playerNumber === '1') {
            reservationModel.set({ isPlayerOnePayed: isPayed });
        } else {
            reservationModel.set({ isPlayerTwoPayed: isPayed });
        }
        reservationModel.set({ isFirstPayment: true });
        await reservationModel.save()
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
    }

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
        const players: PlayerSQL[] = await PlayersModel.findAll({
            attributes: ['id', 'name', 'surname', 'telephone', 'email', 'court', 'stringsName', 'tension', 'racquet', 'weeks', 'notes'],
            include: [
                { model: Opponents, attributes: [['opponentId', 'id']] }
            ]
        }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        players.forEach((pl: PlayerSQL) => {
            const { id, name, surname, telephone, email, priceListId, court, stringsName, tension, racquet, weeks, notes, account, opponents } = pl;
            const save = () => { };
            const newPlayer: Player = {
                id, name, surname, telephone, email, priceListId, court, stringsName, tension, racquet, weeks, notes, account, opponents: [], save
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

    private async updateFields(input: UpdateReservationSQL): Promise<{ updated: boolean, reason: string; }> {
        const reservation: ReservationDataBase = await ReservationModel.findOne({ where: { id: input.id } });
        if (reservation.isFirstPayment) {
            return { updated: false, reason: 'Jest płatność!' };
        }
        if (reservation) {
            const { timetable, form, payment, isPlayerOnePayed, isPlayerTwoPayed, } = input;
            timetable?.ceilHeight !== undefined ? reservation.set({ ceilHeight: timetable?.ceilHeight }) : null;
            timetable?.transformX !== undefined ? reservation.set({ transformX: timetable?.transformX }) : null;
            timetable?.transformY !== undefined ? reservation.set({ transformY: timetable?.transformY }) : null;
            timetable?.zIndex !== undefined ? reservation.set({ zIndex: timetable?.zIndex }) : null;

            form?.date !== undefined ? reservation.set({ date: form?.date }) : null;
            form?.timeFrom !== undefined ? reservation.set({ timeFrom: form?.timeFrom }) : null;
            form?.timeTo !== undefined ? reservation.set({ timeTo: form?.timeTo }) : null;
            form?.court !== undefined ? reservation.set({ court: form?.court }) : null;
            form?.playerOneId !== undefined ? reservation.set({ playerOneId: form?.playerOneId }) : reservation.set({ playerOneId: '' });
            form?.playerTwoId !== undefined ? reservation.set({ playerTwoId: form?.playerTwoId }) : reservation.set({ playerTwoId: '' });
            form?.guestOne !== undefined ? reservation.set({ guestOne: form?.guestOne }) : reservation.set({ guestOne: '' });
            form?.guestTwo !== undefined ? reservation.set({ guestTwo: form?.guestTwo }) : reservation.set({ guestTwo: '' });

            payment?.hourCount !== undefined ? reservation.set({ hourCount: payment?.hourCount }) : null;

            isPlayerOnePayed !== undefined ? reservation.set({ isPlayerOnePayed }) : null;
            isPlayerTwoPayed !== undefined ? reservation.set({ isPlayerTwoPayed }) : null;

            await reservation.save().catch(err => { if (err) { return databaseFailed(err, this.res); } });
            return { updated: true, reason: 'ok' };
        }
        return { updated: false, reason: 'Błędne dane' };
    }

}