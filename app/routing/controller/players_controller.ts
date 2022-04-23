import { NextFunction, Response } from 'express';
import { PlayerSQL, PlayerError, Player, Week, OpponentSQL } from '../interfaces/players_interfaces';
import Request from '../interfaces/request_interfaces';
import Players from '../../models/players';
import Opponents from '../../models/opponents';
import Account from '../../models/account';
import { badRequest, databaseFailed, notAcceptable, notAllowed, unauthorized } from '../../utils/errorRes';
const { validationResult } = require('express-validator');
import sequelize from 'sequelize';


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
        const { name, surname, telephone, email, opponents, weeks, account, priceSummer, priceWinter, court, stringsName, tension, balls, notes } = player;
        const isExist = await Players.findOne({
            where: {
                name, surname
            }
        });
        if (isExist) {
            return notAcceptable(this.res, 'Taki gracz istniej');
        }
        const newPlayer = await Players.create({ name, surname, telephone, email, court, stringsName, weeks, tension, balls, notes }).catch(err => { if (err) { return databaseFailed(this.res); } });
        if (opponents.length) {
            for (let i = 0; i < opponents.length; i++) {
                const el = opponents[i];
                await Opponents.create({ playerId: newPlayer.id, opponentId: el.id }).catch(err => { if (err) { return databaseFailed(this.res); } });
            }
        }
        await Account.create({ playerId: newPlayer.id, account, priceSummer, priceWinter }).catch(err => { if (err) { return databaseFailed(this.res); } });
        return this.res.json({ player: 'created', id: newPlayer.id });
    }

    async getAllPlayers() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
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
        const { id, weeks, opponents, name, surname, telephone, email, priceSummer, priceWinter, court, stringsName, tension, balls, notes }: PlayerSQL = this.req.body;
        const player = await Players.findOne({ where: { id } });
        const samePlayer = await Players.findOne({
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
        player.set({ weeks, name, surname, telephone, email, priceSummer, priceWinter, court, stringsName, tension, balls, notes });
        player.save()
            .then(() => {
                return this.res.json({ updated: true });
            })
            .catch(err => { if (err) { return databaseFailed(this.res); } });
    }

    async deletePlayer() {
        if (!this.req.user.isAdmin) {
            return notAllowed(this.res);
        }
        if (!this.errors.isEmpty()) {
            return this.res.status(400).json({ badRequest: true });
        }
        const id = this.req.params.id;
        const player = await Players.findOne({ where: { id } }).catch(err => { if (err) { databaseFailed(this.res); } });
        if (!player) {
            return this.res.status(400).json({ deletedPlayer: true });
        }
        await player.destroy().catch(err => { if (err) { databaseFailed(this.res); } });
        return this.res.json({ deletedPlayer: true });
    }
}