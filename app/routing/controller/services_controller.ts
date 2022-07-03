import { NextFunction, Response } from 'express';
import ServicesModel from '../../models/services';
import AccountModel from '../../models/account';
import PaymentsHistoryModel from '../../models/paymentHistory';
import { unauthorized, notAcceptable, databaseFailed } from '../../utils/errorRes';
import Request from '../interfaces/request_interfaces';
import { ChargeAccount, Services } from '../interfaces/servies_interface';
const { validationResult } = require('express-validator');

export default class ServiceController {
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

    async getAllServices() {
        if (!this.req.user && !this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const servicesSQL: Services[] = await ServicesModel.findAll().catch(err => { if (err) { return databaseFailed(this.res); } });
        const services: { [key: string]: Services; } = {};
        for (let i in servicesSQL) {
            services[i] = servicesSQL[i];
        }
        this.res.json(services);
    }

    async createOrUpdateServices() {
        if (!this.req.user || !this.req.user.isAdmin) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const services: { [key: string]: Services; } = this.req.body;
        for (let i in services) {
            if (!services[i].id) {
                ServicesModel.create({ name: services[i].name, cost: services[i].cost }).catch(err => { if (err) { return databaseFailed(this.res); } });
            } else {
                const service = await ServicesModel.findOne({ where: { id: services[i].id } }).catch(err => { if (err) { return databaseFailed(this.res); } });
                service.set({ name: services[i].name, cost: services[i].cost });
                await service.save();
            }
        }
        this.res.status(201).json({ message: 'created/updated' });
    }

    async deleteServices() {
        if (!this.req.user || !this.req.user.isAdmin) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const id = this.req.params.id;
        const service = await ServicesModel.findOne({ where: { id } }).catch(err => { if (err) { return databaseFailed(this.res); } });
        if (!service) {
            return this.res.status(400).json({ deletedPlayer: true });
        }
        await service.destroy().catch(err => { if (err) { return databaseFailed(this.res); } });
        return this.res.json({ deletedPlayer: true });
    }

    async chargeAccount() {
        if (!this.req.user) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const data: ChargeAccount = this.req.body;
        const playerAccount = await AccountModel.findOne({ where: { playerId: data.id } }).catch((err) => { if (err) { return notAcceptable(this.res, 'Brak konta'); } });
        const beforeValue: number = parseFloat(playerAccount.account);
        if (data.paymentMethod === 'charge') {
            const afterValue: number = parseFloat(data.value.toString()) + beforeValue;
            playerAccount.set({ account: afterValue });
            await playerAccount.save().catch((err) => { if (err) { return notAcceptable(this.res, 'Błąd aktualizacji kwoty'); } });
            await PaymentsHistoryModel.create({
                paymentMethod: data.paymentMethod,
                value: data.value,
                playerId: data.id,
                playerName: data.name,
                serviceName: data.serviceName,
                accountBefore: beforeValue,
                accountAfter: afterValue,
                cashier: this.req.user.name
            }).catch((err) => { if (err) { return notAcceptable(this.res, 'Nie można zapisać w historii'); } });
            this.res.status(201).json({ message: 'updated' });
        }
        if (data.paymentMethod === 'cash' || data.paymentMethod === 'payment' || data.paymentMethod === 'transfer' || data.paymentMethod === 'debet') {
            let afterValue: number | string = '';
            let isPayed: boolean = true;
            if (data.paymentMethod === 'payment') {
                afterValue = beforeValue - parseFloat(data.value.toString());
            } else {
                afterValue = beforeValue;
            }
            if (data.paymentMethod === 'debet') {
                isPayed = false;
            }
            playerAccount.set({ account: afterValue });
            await playerAccount.save().catch((err) => { if (err) { return notAcceptable(this.res, 'Błąd aktualizacji kwoty'); } });
            await PaymentsHistoryModel.create({
                paymentMethod: data.paymentMethod,
                value: data.value,
                playerId: data.id,
                playerName: data.name,
                serviceName: data.serviceName,
                accountBefore: beforeValue,
                accountAfter: afterValue,
                cashier: this.req.user.name,
                isPayed
            }).catch((err) => { if (err) { return notAcceptable(this.res, 'Nie można zapisać w historii'); } });
            this.res.status(201).json({ message: 'updated' });
        }
    }

}