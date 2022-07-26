import { NextFunction, Response } from 'express';
import { PlayerSQL, PlayerError, Player, Week, OpponentSQL } from '../interfaces/players_interfaces';
import Request from '../interfaces/request_interfaces';
import PlayersModel from '../../models/players';
import Opponents from '../../models/opponents';
import AccountModel from '../../models/account';
import ReservationModel from '../../models/reservation';
import PaymentsHistoryModel from '../../models/paymentHistory';
import { badRequest, databaseFailed, notAcceptable, notAllowed, unauthorized } from '../../utils/errorRes';
const { validationResult } = require('express-validator');
import sequelize from 'sequelize';
import { ReservationDataBase } from '../interfaces/reservation_interfaces';
import { PaymentHistorySQL } from '../interfaces/history_interfaces';


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

    private fixErrors(errors: { errors: Array<any>; }): PlayerError {
        const error: PlayerError = {};
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
                //testing key 'day' i 'time'
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
                //checking if is property a number
                const regEx = /[0-6]/;
                const key = dayKeys[i];
                if (!regEx.test(key)) {
                    return false;
                }
                //checking if is value a 'true'
                if (week.days[key] !== true) {
                    return false;
                }
            }
            const timeKeys = Object.keys(week.time);
            for (let i = 0; i < timeKeys.length; i++) {
                //checking key 'to' and 'from'
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

    private checkOpponents(opponents: OpponentSQL[]) {
        if (opponents.length === 0) {
            return true;
        }
        opponents.forEach(opp => {
            const keyArr = Object.keys(opp);
            if (keyArr.length !== 1) {
                return false;
            }
            for (let i = 0; i < keyArr.length; i++) {
                const key = keyArr[i];
                const regEx = /^(id)$/;
                if (!regEx.test(key)) {
                    return false;
                }
            }
        });
        return true;
    }

    async addPlayer() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            const errors = this.fixErrors(this.errors);
            return badRequest(this.res, errors);
        }
        const player: PlayerSQL = this.req.body;
        const isValidWeek: boolean = this.checkWeek(player.weeks);
        const isValidOpponents: boolean = this.checkOpponents(player.opponents);
        if (!isValidWeek || !isValidOpponents) {
            const error: PlayerError = {
                weeks: !isValidWeek,
                opponents: !isValidOpponents
            };
            return badRequest(this.res, error);
        }
        const { name, surname, telephone, email, opponents, weeks, account, priceListId, court, stringsName, tension, racquet, notes } = player;
        const isExist = await PlayersModel.findOne({
            where: {
                name, surname
            }
        });
        if (isExist) {
            return notAcceptable(this.res, 'Taki gracz istniej');
        }
        const samePlayer = await PlayersModel.findOne({
            where: {
                name,
                surname
            }
        });
        if (samePlayer) {
            return this.res.status(400).json({ alreadyExist: true });
        }
        const newPlayer = await PlayersModel.create({ name, surname, telephone, email, weeks, account, priceListId, court, stringsName, tension, racquet, notes }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        if (opponents.length) {
            for (let i = 0; i < opponents.length; i++) {
                const el = opponents[i];
                await Opponents.create({ playerId: newPlayer.id, opponentId: el.id }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
            }
        }
        await AccountModel.create({ playerId: newPlayer.id, account, }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        return this.res.json({ player: 'created', id: newPlayer.id });
    }

    async getAllPlayers() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        const allPlayers: Player[] = [];
        const players: PlayerSQL[] = await PlayersModel.findAll({
            attributes: ['id', 'name', 'surname', 'telephone', 'email', 'priceListId', 'court', 'stringsName', 'tension', 'racquet', 'weeks', 'notes'],
            include: [
                { model: Opponents, attributes: [['opponentId', 'id']] },
            ]
        }).catch(err => { if (err) { return databaseFailed(err, this.res); } });
        players.forEach((pl: PlayerSQL) => {
            const save = () => { };
            const { id, name, surname, telephone, email, court, stringsName, tension, racquet, weeks, notes, account, opponents, priceListId } = pl;
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
        this.res.json(allPlayers);
    }

    async updatePlayer() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        if (!this.errors.isEmpty()) {
            const errors = this.fixErrors(this.errors);
            return badRequest(this.res, errors);
        }
        const isValidWeek: boolean = this.checkWeek(this.req.body.weeks);
        const isValidOpponents: boolean = this.checkOpponents(this.req.body.opponents);
        if (!isValidWeek || !isValidOpponents) {
            const error: PlayerError = {
                weeks: !isValidWeek,
                opponents: !isValidOpponents
            };
            return badRequest(this.res, error);
        }
        const { id, weeks, opponents, name, surname, telephone, email, priceListId, court, stringsName, tension, racquet, notes }: PlayerSQL = this.req.body;
        const player = await PlayersModel.findOne({ where: { id } });
        const samePlayer = await PlayersModel.findOne({
            where: {
                id: { [sequelize.Op.not]: id },
                name,
                surname
            }
        });
        if (samePlayer) {
            return this.res.status(400).json({ alreadyExist: true });
        }
        if (!player) {
            return this.res.status(404).json({ nonExistPlayer: true });
        }
        const playerOpponents: Array<any> = await Opponents.findAll({
            where: {
                playerId: id
            }
        });
        playerOpponents.forEach(op => {
            if (!opponents.includes({ id: op.opponentId })) {
                op.destroy();
            }
        });
        opponents.forEach(op => {
            if (!playerOpponents.includes({ playerId: id, opponentId: op.id, })) {
                Opponents.create({ playerId: id, opponentId: op.id });
            }
        });
        player.set({ weeks, name, surname, telephone, email, priceListId, court, stringsName, tension, racquet, notes });
        player.save()
            .then(() => {
                return this.res.json({ updated: true });
            })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
    }
    async deletePlayer() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        if (!this.errors.isEmpty()) {
            return this.res.status(400).json({ badRequest: true });
        }
        const id = this.req.params.id;
        const player = await PlayersModel.findOne({ where: { id } });
        if (!player) {
            return this.res.status(400).json({ deletedPlayer: true });
        }
        const reser1: ReservationDataBase[] = await ReservationModel.findAll({ where: { playerOneId: id } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        reser1.forEach(async r => {
            r.set({ playerOneId: '', guestOne: '--Gracz usunięty z bazy--' });
            await r.save().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        });
        const reser2: ReservationDataBase[] = await ReservationModel.findAll({ where: { playerTwoId: id } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        reser2.forEach(async r => {
            r.set({ playerTwoId: '', guestTwo: '--Gracz usunięty z bazy--' });
            await r.save().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        });
        const paymentHistory: PaymentHistorySQL[] = await PaymentsHistoryModel.findAll({ where: { playerId: id } })
            .catch(err => { if (err) { return databaseFailed(err, this.res); } });
        paymentHistory.forEach(async p => {
            p.set({ playerId: '', playerName: '--Gracz usunięty z bazy--' });
            await p.save().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        });
        await player.destroy().catch(err => { if (err) { return databaseFailed(err, this.res); } });
        return this.res.json({ deletedPlayer: true });
    }
} 