import { Request } from 'express';

export default interface UerRequest extends Request {
    user: any;
}

export interface ProfileError {
    name?: boolean,
    login?: boolean,
    newPassword?: boolean,
    confirmNewPassword?: boolean;
}