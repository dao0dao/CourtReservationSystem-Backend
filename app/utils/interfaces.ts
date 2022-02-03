import { Request } from 'express';

export default interface UerRequest extends Request {
    user: any;
}

export interface ProfileError {
    id?: boolean,
    name?: boolean,
    login?: boolean,
    newPassword?: boolean,
    confirmNewPassword?: boolean;
}

export interface Week {
    days: {
        0?: boolean | undefined;
        1?: boolean | undefined;
        2?: boolean | undefined;
        3?: boolean | undefined;
        4?: boolean | undefined;
        5?: boolean | undefined;
        6?: boolean | undefined;
    };
    time: {
        from: string;
        to: string;
    };
}

export interface Opponent {
    id: string,
    name: string,
    surname: string;
}

export interface AddPlayer {
    weeks: Week[];
    opponents: Opponent[];
    name: string,
    surname: string,
    telephone: number,
    email?: string,
    account: number,
    priceSummer: number,
    priceWinter: number,
    court?: number,
    strings?: string,
    tension: number,
    balls?: string,
    notes?: string;
};

export type PlayerSql = Omit<AddPlayer, 'opponents'> & { opponents: Omit<Opponent, 'name' | 'surname'>[]; };

export interface AddPlayerError {
    name?: boolean;
    surname?: boolean;
    telephone?: boolean;
    email?: boolean;
    account?: boolean;
    priceSummer?: boolean;
    priceWinter?: boolean;
    court?: boolean;
    strings?: boolean;
    tension?: boolean;
    balls?: boolean;
    notes?: boolean;
    opponents?: boolean;
    weeks?: boolean;
}