

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


export type Opponent = { id: string, name: string, surname: string; };

export type OpponentSQL = { id: string; };

export interface PlayerSQL {
    save();
    id: string,
    weeks: Week[],
    opponents: OpponentSQL[],
    name: string,
    surname: string,
    telephone: number,
    email?: string,
    account?: number,
    priceListId?: string,
    court?: number,
    stringsName?: string,
    tension: number,
    racquet?: string,
    notes?: string;
};

export type PlayerIncludedSQL = Omit<PlayerSQL, 'priceListId'> & { priceList: { id: string; }; };

export type Player = Omit<PlayerSQL, 'opponents'> & { opponents: Opponent[]; };

export interface AccountSql {
    playerId: string,
    account: number,
    priceList: string;
}

export interface PlayerError {
    name?: boolean;
    surname?: boolean;
    telephone?: boolean;
    email?: boolean;
    account?: boolean;
    priceList?: boolean;
    court?: boolean;
    strings?: boolean;
    tension?: boolean;
    racquet?: boolean;
    notes?: boolean;
    opponents?: boolean;
    weeks?: boolean;
}