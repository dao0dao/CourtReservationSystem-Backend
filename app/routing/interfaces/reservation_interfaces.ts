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
    isPayed: boolean;
}

export type ReservationForm = Pick<Reservation, 'form'>;

export type FormSQL = Omit<Reservation['form'], 'playerOne' | 'playerTwo'> & { playerOneId: string; } & { playerTwoId: string; };

export type ReservationSQL = Omit<Reservation, 'form'> & { form: FormSQL; destroy: () => Promise<any>; };

export type UpdateReservationSQL = Omit<Partial<ReservationSQL>, 'form'> & { form: Partial<Omit<FormSQL, 'date'>> & { date: string; }; };

export interface createReservationResponse {
    status: 'added';
    id: string;
}