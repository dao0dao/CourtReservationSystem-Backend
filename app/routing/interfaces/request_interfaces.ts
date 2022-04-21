import { Request } from 'express';

export default interface UerRequest extends Request {
    user: any;
}