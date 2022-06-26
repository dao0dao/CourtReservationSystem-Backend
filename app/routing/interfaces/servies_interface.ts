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
    action: 'charge' | 'payment' | 'cash' | 'transfer';
}