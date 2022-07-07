import { NextFunction, Response } from 'express';
import { unauthorized, notAcceptable, databaseFailed } from '../../utils/errorRes';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import PaymentsHistoryModel from '../../models/paymentHistory';
import AccountModel from '../../models/account';
import { Op } from 'sequelize';
import { BalancePayment } from '../interfaces/history_interfaces';

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
            .catch(err => { if (err) { return databaseFailed(this.res); } });
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
        const payment = await PaymentsHistoryModel.findAll({
            where: {
                playerId: playerId,
                createdAt: { [Op.between]: [dateFrom, dateTo] },
            },
            attributes: ['id', ['value', 'price'], 'cashier', ['serviceName', 'service'], ['createdAt', 'date'], ['isPayed', 'isPaid']]
        })
            .catch(err => { if (err) { return databaseFailed(this.res); } });
        if (payment.length) {
            payment.forEach(p => {
                p.dataValues.date = new Date(p.dataValues.date).toLocaleDateString();
                p.dataValues.isPaid === 0 ? p.dataValues.isPaid = false : p.dataValues.isPaid = true;
            });
        }
        this.res.json(payment);
    }

}