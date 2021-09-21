import { Component, Element, h, Prop, State } from '@stencil/core';

import type { beverage } from '../../../interfaces/app-user';
import type { formInput } from '../../../interfaces/common';

import { Caffeine } from '../../../providers/caffeine';
import AutoNumeric from 'autonumeric';

@Component({
    tag: 'modal-tracker',
    styleUrl: 'modal-tracker.css',
})

export class ModalTracker {
    @Element() element: HTMLElement;
    @Prop() beverage: beverage;
    @Prop() currentIntake: number;
    @State() beverageAmount: formInput = {
        value: null,
        valid: false,
    }
    @State() caffeineLevels: number = 0;
    @State() drinksLeft: number = null;

    async componentDidLoad() {
        setTimeout(async () => {
            const amountInput: HTMLIonInputElement = this.element.querySelector("#amountInput");
            const amountInputElement = await amountInput.getInputElement();
            new AutoNumeric(amountInputElement, 'numericPos').set(null, { digitGroupSeparator: "", decimalPlaces: 0, emptyInputBehavior: 'null', maximumValue: '25' });
        }, 500);
    }

    async dismiss(data?: any) {
        (this.element.closest('ion-modal') as any).dismiss(data);
    }

    private validForm(): boolean {
        if (!this.beverageAmount.valid) return false;
        return true;
    }

    render() {
        return [
            <ion-header translucent={true}>
                <ion-toolbar>
                    <ion-title>
                        Calculate Intake
                    </ion-title>
                    <ion-buttons slot="end">
                        <ion-button onClick={() => this.dismiss()}>
                            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>,

            <ion-content scrollX={false} scrollY={true}>
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Beverage Amount</ion-card-title>
                    </ion-card-header>
                    <ion-item class="ion-padding-bottom">
                        <ion-input
                            id="amountInput"
                            value={this.beverageAmount.value}
                            type="tel"
                            inputmode="tel"
                            spellcheck={false}
                            autocomplete="off"
                            minlength={1}
                            autocorrect="off"
                            autocapitalize="off"
                            debounce={500}
                            onIonInput={(event: any) => {
                                this.beverageAmount = {
                                    ...this.beverageAmount,
                                    value: event.target.value,
                                    valid: !!event.target.value,
                                }
                                const myIntake = Caffeine.calculateCaffeine({
                                    amount: this.beverageAmount.value,
                                    servingsPerUnit: this.beverage.servingsPerUnit,
                                    caffeinePerUnit: this.beverage.caffeinePerUnit,
                                    currentIntake: this.currentIntake,
                                });
                                this.caffeineLevels = myIntake.caffeine;
                                this.drinksLeft = myIntake.drinksLeft;
                            }}
                            placeholder="how many did you drink?"></ion-input>
                    </ion-item>
                </ion-card>
                <ion-card>
                    <ion-card-header>
                        <ion-card-subtitle>500mg or less is safe</ion-card-subtitle>
                        <ion-card-title>My Intake</ion-card-title>
                    </ion-card-header>
                    <ion-card-content style={{
                        'flex': '1 1 auto',
                        'padding': '0'
                    }}>
                        <ion-item>
                            <ion-label>
                                <h2>Beverage</h2>
                                <h3>{this.beverage.title}</h3>
                            </ion-label>
                        </ion-item>

                        <ion-item>
                            <ion-label>
                                <h2>Caffeine consumed</h2>
                                <h3>{this.caffeineLevels} mg</h3>
                            </ion-label>
                        </ion-item>

                        <ion-item class="ion-padding-bottom" hidden={this.drinksLeft === null}>
                            <ion-label>
                                <h2>How many more can I have?</h2>
                                <h3>{this.drinksLeft}</h3>
                            </ion-label>
                        </ion-item>
                    </ion-card-content>
                </ion-card>
            </ion-content>,
            <ion-footer>
                <ion-button color="secondary" class="ion-no-margin ion-no-padding ion-margin-bottom primary-action"
                    disabled={!this.validForm()} onClick={() => this.dismiss({
                        caffeineLevels: this.caffeineLevels
                    })} fill={!this.validForm() ? "outline" : "solid"} expand="full">
                    Save Intake
                </ion-button>
            </ion-footer>
        ];
    }
}