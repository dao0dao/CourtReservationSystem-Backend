import { NextFunction, Response } from 'express';
import { unauthorized, notAcceptable, databaseFailed } from '../../utils/errorRes';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import PaymentsHistoryModel from '../../models/paymentHistory';
import ReservationModel from '../../models/reservation';
import AccountModel from '../../models/account';
import { Op } from 'sequelize';
import { Payment, PaymentHistorySQL, } from '../interfaces/history_interfaces';
import { ReservationDataBase } from '../interfaces/reservation_interfaces';

export default class HistoryController {
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

    async getPlayerBalance() {
        if (!this.req.user && !this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const playerId = this.req.query.playerId;
        const account = await AccountModel.findOne({ where: { playerId } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        if (!account) {
            return notAcceptable(this.res, 'Brak takiego konta');
        }
        this.res.json({ balance: account.account });
    }

    async getPlayerHistory() {
        if (!this.req.user && !this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const playerId = this.req.query.playerId;
        const dateFrom = this.req.query.dateFrom;
        const dateTo: string = this.req.query.dateTo?.toString()!;
        const whereOption = {
            createdAt: { [Op.between]: [dateFrom, dateTo] },
        };
        if (playerId !== 'undefined') {
            whereOption['playerId'] = playerId;
        }
        const payment = await PaymentsHistoryModel.findAll({
            where: whereOption,
            attributes: ['id', 'playerId', 'playerName', ['value', 'price'], 'cashier', ['serviceName', 'service'], ['createdAt', 'date'], ['isPayed', 'isPaid'], 'gameId']
        })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        if (payment.length) {
            payment.forEach(p => {
                p.dataValues.date = new Date(p.dataValues.date).toLocaleDateString();
                p.dataValues.isPaid === 0 ? p.dataValues.isPaid = false : p.dataValues.isPaid = true;
            });
        }
        this.res.json(payment);
    }

    async historyPayment() {
        if (!this.req.user && !this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const data: Payment = this.req.body;
        const today = new Date().getTime();
        const payment: PaymentHistorySQL = await PaymentsHistoryModel.findOne({
            where: {
                id: data.historyId,
                playerId: data.playerId,
                value: data.price,
                serviceName: data.service,
                isPayed: false
            }
        }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        if (!payment) {
            return notAcceptable(this.res, 'Wpis nie istniej, przeładuj stronę i spróbuj jeszcze raz');
        }
        const date = payment.createdAt!.toLocaleDateString().slice(0, 10);
        const paymentDate = new Date(date).getTime();
        if ((paymentDate < today && !this.req.user.isAdmin)) {
            return notAcceptable(this.res, 'Brak uprawnień');
        }
        if (data.method === 'payment' && data.playerId) {
            const account = await AccountModel.findOne({
                where: {
                    playerId: data.playerId
                }
            })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            const accountBefore = parseFloat(account.account);
            const accountAfter = accountBefore - parseFloat((data.price).toString());
            account.set({
                account: accountAfter
            });
            await account.save().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        }
        payment.set({
            isPayed: true,
            cashier: this.req.user.name,
            paymentMethod: data.method
        });
        await payment.save().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        if (payment.gameId) {
            const reservation: ReservationDataBase = await ReservationModel.findOne({ where: { id: payment.gameId } })
                .catch(err => { if (err) { return databaseFailed(err, this.res); } });
            if (payment.playerId) {
                reservation.playerOneId === payment.playerId ? reservation.set({ isPlayerOnePayed: true }) : null;
                reservation.playerTwoId === payment.playerId ? reservation.set({ isPlayerTwoPayed: true }) : null;
            } else if (payment.playerName && !payment.playerId) {
                reservation.guestOne === payment.playerName ? reservation.set({ isPlayerOnePayed: true }) : null;
                reservation.guestTwo === payment.playerName ? reservation.set({ isPlayerTwoPayed: true }) : null;
            }
            await reservation.save();
        }
        this.res.json({ update: true });
    }

}