import { Player } from "./players_interfaces";

export interface Reservation {
    id?: string;
    timetable: {
        transformY: number;
        transformX: number;
        ceilHeight: number;
        zIndex: number;
    };
    form: {
        date: string;
        timeFrom: string;
        timeTo: string;
        court: string;
        playerOne: Player | undefined;
        playerTwo: Player | undefined;
        guestOne: string;
        guestTwo: string;
    };
    payment: {
        hourCount: number;
    };

    isEditable?: boolean;
    isPlayerOnePayed: boolean;
    isPlayerTwoPayed: boolean;
}

export interface ReservationDataBase {
    id?: string;
    transformY: number;
    transformX: number;
    ceilHeight: number;
    zIndex: number;
    date: string;
    timeFrom: string;
    timeTo: string;
    court: string;
    playerOneId: string | undefined;
    playerTwoId: string | undefined;
    guestOne: string | undefined;
    guestTwo: string | undefined;
    hourCount: number;
    isEditable?: boolean;
    isPlayerOnePayed: boolean;
    isPlayerTwoPayed: boolean;
    destroy: () => Promise<any>;
    update: (obj: {}) => Promise<any>;
    save: () => Promise<any>;
}

export type ReservationForm = Pick<Reservation, 'form'>;

export type FormSQL = Omit<Reservation['form'], 'playerOne' | 'playerTwo'> & { playerOneId: string; } & { playerTwoId: string; };

export type ReservationSQL = Omit<Reservation, 'form'> & { form: FormSQL; destroy: () => Promise<any>; update: (arg0: {}) => Promise<any>; save: () => Promise<any>; };

export type UpdateReservationSQL = Omit<Partial<ReservationSQL>, 'form'> & { form: Partial<Omit<FormSQL, 'date'>> & { date: string; }; };

export interface createReservationResponse {
    status: 'added';
    id: string;
}

export interface PlayerPayment {
    id?: string;
    name: string;
    method: 'payment' | 'cash' | 'transfer' | 'debet';
    value: number;
    serviceName: string;
}

export type Method = PlayerPayment['method'];

export interface ReservationPayment {
    playerOne?: PlayerPayment;
    playerTwo?: PlayerPayment;
    reservationId: string;
}