import { getMode } from '@ionic/core';
import { Component, Element, h, State } from '@stencil/core';
import { formInput } from '../../../interfaces/common';

@Component({
    tag: 'modal-login',
    styleUrl: 'modal-login.css',
})

export class ModalLogin {
    private ios: boolean;
    @Element() element: HTMLElement;
    @State() email: formInput = {
        value: null,
        valid: false,
    };
    @State() password: formInput = {
        value: null,
        valid: false,
    };

    async componentWillLoad() {
        this.ios = getMode() === 'ios';
    }

    async dismiss(data?: any) {
        (this.element.closest('ion-modal') as any).dismiss(data);
    }

    private validForm(): boolean {
        if (!this.email.valid) return false;
        if (!this.password.valid) return false;
        return true;
    }

    render() {
        return [
            <ion-header translucent={true}>
                <ion-toolbar>
                    <ion-title>
                        Sign in
                    </ion-title>
                    <ion-buttons slot="end">
                        <ion-button onClick={() => this.dismiss()}>
                            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>,

            <ion-content scrollX={false} scrollY={true}>
                <ion-list lines={this.ios ? 'inset' : 'full'} class="ion-padding-bottom">
                    <ion-item>
                        <ion-label position="stacked">Email</ion-label>
                        <ion-input debounce={500}
                            spellcheck={false}
                            placeholder="john@doe.com"
                            type="email"
                            inputmode="email"
                            autocorrect="off"
                            autocapitalize="off"
                            autocomplete="off"
                            onIonInput={(event: any) => this.email = {
                                ...this.email,
                                value: event.target.value,
                                valid: !!event.target.value,
                            }}></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-label position="stacked">Password</ion-label>
                        <ion-input debounce={500}
                            spellcheck={false}
                            placeholder="janeDoe"
                            type="password"
                            inputmode="text"
                            autocorrect="off"
                            autocapitalize="off"
                            autocomplete="off"
                            onIonInput={(event: any) => this.password = {
                                ...this.password,
                                value: event.target.value,
                                valid: !!event.target.value,
                            }}></ion-input>
                    </ion-item>
                </ion-list>
            </ion-content>,
            <ion-footer>
                <ion-button color="secondary" class="ion-no-margin ion-no-padding ion-margin-bottom primary-action"
                    disabled={!this.validForm()} onClick={() => this.dismiss({
                        email: this.email.value,
                        password: this.password.value,
                    })}
                    fill={!this.validForm() ? "outline" : "solid"} expand="full">
                    Login
                </ion-button>
            </ion-footer>
        ];
    }
}