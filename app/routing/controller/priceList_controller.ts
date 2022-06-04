import { NextFunction, Response } from 'express';
import { unauthorized, notAcceptable, databaseFailed } from '../../utils/errorRes';
import Request from '../interfaces/request_interfaces';
const { validationResult } = require('express-validator');
import PriceListModel from '../../models/priceList';
import { PriceList } from '../interfaces/priceList_interfaces';

export default class PriceListController {
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

    async getAllPriceLists() {
        if (!this.req.user && !this.errors.isEmpty()) {
            return unauthorized(this.res);
        }
        const priceList = await PriceListModel.findAll({
            attributes: ['id', 'name', 'hours']
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        this.res.json(priceList);
    }

    async createPriceList() {
        if (!this.req.user || !this.req.user.isAdmin) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const { name, hours } = this.req.body;
        const isExist = await PriceListModel.findOne({
            where: { name }
        });
        if (isExist) {
            return this.res.status(400).json({ alreadyExist: true });
        }
        const priceList: PriceList = await PriceListModel.create({
            name, hours
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        this.res.json({ status: 201, id: priceList.id });
    }

    async editPriceList() {
        if (!this.req.user || !this.req.user.isAdmin) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const { id, name, hours } = this.req.body;
        const priceList: PriceList = await PriceListModel.findOne({
            where: { id },
            attributes: ['id', 'name', 'hours']
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        const existedPriceList: PriceList[] = await PriceListModel.findAll({
            where: {
                name
            }
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        let isExist: boolean = false;
        for (let i = 0; i < existedPriceList.length; i++) {
            if (priceList.id !== existedPriceList[i].id) {
                isExist = true;
            }
        }
        if (isExist) {
            return this.res.status(400).json({ alreadyExist: true });
        }
        priceList.update({
            name, hours
        });
        await priceList.save();
        this.res.status(202).json({ updated: true });
    }

    async deletePriceList() {
        if (!this.req.user || !this.req.user.isAdmin) {
            return unauthorized(this.res);
        }
        if (!this.errors.isEmpty()) {
            return notAcceptable(this.res, 'Błędne dane');
        }
        const id = this.req.params.id;
        const priceList: PriceList = await PriceListModel.findOne({
            where: { id }
        }).catch(err => { if (err) { return databaseFailed(this.res); } });
        if (priceList) {
            priceList.destroy();
        }
        return this.res.json({ deleted: true });
    }

}