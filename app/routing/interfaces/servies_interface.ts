export interface Services {
    id: string,
    name: string,
    cost: number;
}

export interface ChargeAccount {
    id: string,
    value: number | string,
    name: string;
    serviceName: string;
    paymentMethod: 'charge' | 'payment' | 'cash' | 'transfer';
}