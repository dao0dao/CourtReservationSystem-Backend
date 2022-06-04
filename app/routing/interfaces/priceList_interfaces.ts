export interface HourPrice {
    from: string;
    to: string;
    price: number;
}

export interface PriceList {
    destroy();
    update(arg0: { name: any; hours: any; });
    id?: string;
    name: string;
    hours: { [key: string]: HourPrice; };
    set(arg: { [key: string]: any; });
    save();
}