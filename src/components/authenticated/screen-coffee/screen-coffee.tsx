import { Component, h, Prop, State, Element, Event, EventEmitter } from '@stencil/core';
import type { User } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';
import type { AppUser } from '../../../interfaces/app-user';
import type { Observable, Subscription } from "rxjs";

import { doc } from 'firebase/firestore';
import { Firebase } from '../../../providers/firebase';
import { docData } from 'rxfire/firestore';
import { authState } from 'rxfire/auth';
import { pathType } from '../../../interfaces/constants';

@Component({
    tag: 'screen-coffee',
    styleUrl: 'screen-coffee.css'
})
export class ScreenCoffee {
    @Prop() routerNav: HTMLIonRouterElement;
    @Element() element: HTMLElement;
    @Event() haptic: EventEmitter<any>;
    private authObservable: Observable<User>;
    private authSubscription: Subscription;
    private userObservable: Observable<DocumentData>;
    private userSubscription: Subscription;
    @State() appUser: AppUser = null;

    connectedCallback() {
        this.routerNav = document.querySelector('ion-router');
    }

    componentWillLoad() {
        this.authObservable = authState(Firebase.auth);
        this.authSubscription = this.authObservable.subscribe((auth: User) => {
            if (auth) {
                this.userObservable = docData(doc(Firebase.firestore, `${pathType.users}/${Firebase.auth.currentUser.uid}`));
                this.userSubscription = this.userObservable.subscribe((appUser: AppUser) => {
                    this.appUser = { ...appUser };
                });
            }
        });
    }

    disconnectedCallback() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    async signOut() {
        this.haptic.emit();
        await Firebase.auth.signOut();
    }

    renderContent() {
        if (!this.appUser) {
            return (
                <ion-list>
                    <ion-card>
                        <ion-card-header>
                            <h3>
                                <ion-skeleton-text animated class="skeleton-80"></ion-skeleton-text>
                            </h3>
                            <h3>
                                <ion-skeleton-text animated class="skeleton-50"></ion-skeleton-text>
                            </h3>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-thumbnail class="skeleton-card-image" slot="start">
                                <ion-skeleton-text animated></ion-skeleton-text>
                            </ion-thumbnail>
                        </ion-card-content>
                        <ion-row>
                            <ion-col>
                                <ion-item lines="none" class="ion-margin-left">
                                    <ion-label>
                                        <ion-skeleton-text animated class="skeleton-100"></ion-skeleton-text>
                                    </ion-label>
                                </ion-item>
                            </ion-col>
                        </ion-row>
                    </ion-card>
                </ion-list>
            )
        } else {
            return (
                <ion-list>
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>My Profile</ion-card-title>
                        </ion-card-header>
                        <ion-card-content style={{
                            'flex': '1 1 auto',
                            'padding': '0'
                        }}>
                            <ion-item>
                                <ion-label>
                                    <h2>Roast Level</h2>
                                    <h3>{this.appUser.coffee.roast.value[0]}</h3>
                                </ion-label>
                            </ion-item>

                            <ion-item>
                                <ion-label>
                                    <h2>Tasting Notes</h2>
                                    <h3>{this.appUser.coffee.notes.value[0]}</h3>
                                </ion-label>
                            </ion-item>

                            <ion-item>
                                <ion-label>
                                    <h2>Brew Method</h2>
                                    <h3>{this.appUser.coffee.method.value[0]}</h3>
                                </ion-label>
                            </ion-item>
                        </ion-card-content>
                        <ion-row>
                            <ion-col>
                                <ion-button
                                    color="danger"
                                    fill="solid"
                                    shape="round"
                                    expand="full"
                                    onClick={() => this.signOut()}>Sign out</ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-card>
                </ion-list>
            )
        }
    }

    render() {
        return [
            <ion-header translucent={true}>
                <ion-toolbar>
                    <ion-title>Coffee</ion-title>
                </ion-toolbar>
            </ion-header>,

            <ion-content scrollX={false} scrollY={true} fullscreen={true}>
                <ion-header collapse="condense" translucent={true}>
                    <ion-toolbar>
                        <ion-title size="large">Coffee</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-grid fixed>
                    <ion-row>
                        <ion-col size="12" size-md="6">
                            {this.renderContent()}
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-content>
        ];
    }

}