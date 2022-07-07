export interface Balance {
    id: string;
    date: string;
    service: string;
    price: number;
    isPaid: boolean;
    method: string;
    beforePayment: number;
    afterPayment: number;
    cashier: string;
}

export interface BalancePayment {
    id: string;
    playerId: string;
    method: 'payment' | 'cash' | 'transfer' | 'debet';
}