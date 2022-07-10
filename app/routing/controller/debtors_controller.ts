import { NextFunction, Response } from 'express';
import { unauthorized, notAcceptable, databaseFailed } from '../../utils/errorRes';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import AccountModel from '../../models/account';
import PlayersModel from '../../models/players';
import { Op } from 'sequelize';
import { PlayerSQL } from '../interfaces/players_interfaces';
import { Debtor } from '../interfaces/debtor_interface';

export default class DebtorController {
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

    async getAllDebtors() {
        if (!this.req.user && !this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const debtorsAccounts: any[] = await AccountModel.findAll({
            where: {
                account: { [Op.lt]: 0 }
            },
            attributes: ['account', 'playerId']
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        if (!debtorsAccounts.length) {
            return this.res.json([]);
        }
        const playerIdArr: string[] = [];
        debtorsAccounts.forEach(ac => {
            playerIdArr.push(ac.playerId);
        });
        const playerArr: PlayerSQL[] = await PlayersModel.findAll({
            where: {
                id: { [Op.or]: playerIdArr },
            },
            attributes: ['id', 'name', 'surname', 'telephone', 'email']
        }).catch(err => { if (err) { return databaseFailed(this.res); } });;
        if (!playerArr.length) {
            return this.res.json([]);
        }
        const debtorsArr: Debtor[] = [];
        playerArr.forEach(pl => {
            const account = debtorsAccounts.find(ac => ac.playerId === pl.id);
            const debtor: Debtor = {
                name: pl.name,
                surname: pl.surname,
                email: pl.email,
                telephone: pl.telephone,
                account: account.account
            };
            debtorsArr.push(debtor);
        });
        return this.res.json(debtorsArr);
    }
}