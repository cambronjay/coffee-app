import type { FieldValue } from "firebase/firestore";

import { formArrayInput } from "./common";

export interface AppUser {
    ID: string;
    timestamp: FieldValue;
    firstName: string;
    lastName: string;
    coffee: coffee;
    caffeine: caffeine;
    currentIntake: number;
}

export interface coffee {
    roast: formArrayInput;
    notes: formArrayInput;
    method: formArrayInput;
}

export interface caffeine {
    beverages: Array<beverage>;
}

export interface beverage {
    title: string;
    hide: boolean;
    description: string;
    caffeinePerUnit: string;
    servingsPerUnit: string;
    unitVolume: string;
    photo: string;
}

export interface intake {
    amount: string;
    servingsPerUnit: string;
    caffeinePerUnit: string;
    currentIntake: number;
}

export interface myIntake {
    caffeine: number;
    drinksLeft: number;
}