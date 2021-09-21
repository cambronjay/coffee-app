import { Component, h, Prop, State, Element, Event, EventEmitter, forceUpdate } from '@stencil/core';
import type { User } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';
import type { AppUser, beverage } from '../../../interfaces/app-user';
import type { Observable, Subscription } from "rxjs";

import { modalController, alertController } from '@ionic/core'
import { Caffeine } from '../../../providers/caffeine';
import { doc, setDoc, arrayRemove } from 'firebase/firestore';
import { Firebase } from '../../../providers/firebase';
import { docData } from 'rxfire/firestore';
import { authState } from 'rxfire/auth';
import { pathType } from '../../../interfaces/constants';

@Component({
    tag: 'screen-caffeine',
    styleUrl: 'screen-caffeine.css'
})
export class ScreenCaffeine {
    @Prop() routerNav: HTMLIonRouterElement;
    @Element() element: HTMLElement;
    @Event() haptic: EventEmitter<any>;
    private authObservable: Observable<User>;
    private authSubscription: Subscription;
    private userObservable: Observable<DocumentData>;
    private userSubscription: Subscription;
    @State() appUser: AppUser = null;
    @Event() hideSplashScreen: EventEmitter<any>;
    @State() query = '';
    @State() beverages: Array<beverage> = [];
    @State() shownBeverages: any = [];
    @State() caffeineLevels: number = 0;

    connectedCallback() {
        this.routerNav = document.querySelector('ion-router');
    }

    componentWillLoad() {
        this.authObservable = authState(Firebase.auth);
        this.authSubscription = this.authObservable.subscribe((auth: User) => {
            if (auth) {
                this.userObservable = docData(doc(Firebase.firestore, `${pathType.users}/${Firebase.auth.currentUser.uid}`));
                this.userSubscription = this.userObservable.subscribe((appUser: AppUser) => {
                    if (appUser && appUser.caffeine) {
                        this.beverages = appUser.caffeine.beverages;
                        this.shownBeverages = appUser.caffeine.beverages.length;
                        this.appUser = { ...appUser };
                        this.caffeineLevels = appUser.currentIntake / 500;
                    }
                });
            }
        });
    }

    componentDidLoad() {
        this.hideSplashScreen.emit({ hide: true });
    }

    disconnectedCallback() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    async updateBeverages(beverages: Array<beverage>) {
        const searchResults = await Caffeine.search(this.query, beverages);
        this.shownBeverages = searchResults.shownBeverages;
        this.beverages = searchResults.beverages;
        forceUpdate(this.element);
    }

    searchBeverages(event: any) {
        this.query = event.target.value;
        this.updateBeverages(this.appUser.caffeine.beverages);
    }

    async track(beverage: beverage) {
        const modal = await modalController.create({
            component: 'modal-tracker',
            swipeToClose: false,
            presentingElement: this.element.closest('ion-router-outlet'),
            componentProps: {
                beverage: beverage,
                currentIntake: this.appUser.currentIntake,
            }
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data && data.caffeineLevels) {
            await setDoc(doc(Firebase.firestore, `${pathType.users}/${Firebase.auth.currentUser.uid}`), {
                currentIntake: this.appUser.currentIntake + data.caffeineLevels
            }, { merge: true });
        }
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
            return [
                <ion-list hidden={this.shownBeverages === 0}>
                    {this.beverages.map((beverage: beverage) =>
                        <ion-card hidden={beverage.hide}>
                            <ion-card-header style={{ 'padding': '0' }}>
                                <ion-item lines="full" style={{ '--min-height': '85px' }}>
                                    <ion-avatar slot="start" style={{
                                        'width': '65px',
                                        'height': '65px'
                                    }}>
                                        <ion-img src={beverage.photo}></ion-img>
                                    </ion-avatar>
                                    <ion-label>
                                        <h2 style={{
                                            'font-size': '18px',
                                            'font-weight': '500',
                                            'letter-spacing': '0.02em'
                                        }}>{beverage.title}</h2>
                                    </ion-label>
                                </ion-item>
                            </ion-card-header>
                            <ion-card-content style={{
                                'flex': '1 1 auto',
                                'padding': '0'
                            }}>
                                <ion-item>
                                    <ion-textarea readonly value={beverage.description}></ion-textarea>
                                </ion-item>

                                <ion-item>
                                    <ion-icon name="beaker-outline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2>Beverage volume</h2>
                                        <h3>{beverage.unitVolume} fl oz</h3>
                                    </ion-label>
                                </ion-item>

                                <ion-item>
                                    <ion-icon name="pint-outline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2>Servings per beverage</h2>
                                        <h3>{beverage.servingsPerUnit}</h3>
                                    </ion-label>
                                </ion-item>

                                <ion-item>
                                    <ion-icon name="eyedrop-outline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2>Caffeine per serving</h2>
                                        <h3>{beverage.caffeinePerUnit} mg</h3>
                                    </ion-label>
                                </ion-item>

                            </ion-card-content>
                            <ion-row>
                                <ion-col>
                                    <ion-item lines="none">
                                        <ion-button shape="round" size="small" slot="start" onClick={() => this.delete(beverage)}>DELETE</ion-button>
                                        <ion-button shape="round" size="small" slot="end" onClick={() => this.track(beverage)}>TRACK</ion-button>
                                    </ion-item>
                                </ion-col>
                            </ion-row>
                        </ion-card>
                    )}
                </ion-list>,
                <ion-list-header hidden={this.shownBeverages > 0}>
                    No beverage found
                </ion-list-header>
            ]
        }
    }

    private clearSearch() {
        this.query = '';
        this.updateBeverages(this.appUser.caffeine.beverages);
    }

    async clearIntake() {
        await setDoc(doc(Firebase.firestore, `${pathType.users}/${Firebase.auth.currentUser.uid}`), {
            currentIntake: 0
        }, { merge: true });
    }

    async delete(beverage: beverage) {
        const alert = await alertController.create({
            backdropDismiss: false,
            header: 'Beverage',
            message: 'Delete this beverage?',
            buttons: [
                { text: 'Yes' }
            ]
        });
        await alert.present();
        await setDoc(doc(Firebase.firestore, `${pathType.users}/${Firebase.auth.currentUser.uid}`), {
            caffeine: {
                beverages: arrayRemove(beverage)
            }
        }, { merge: true });
    }

    async add() {

    }

    render() {
        return [
            <ion-header translucent={true}>
                <ion-toolbar>
                    <ion-title>Caffeine Tracker</ion-title>
                    <ion-buttons slot="end">
                        <ion-button fill="clear" onClick={() => this.add()}>ADD</ion-button>
                    </ion-buttons>
                </ion-toolbar>
                {!Firebase.ios && <ion-toolbar>
                    <ion-searchbar
                        showCancelButton="never"
                        id="searchBar"
                        autocomplete="off"
                        autocorrect="off"
                        animated={true}
                        inputmode="text"
                        type="search"
                        value={this.query}
                        onIonClear={() => this.clearSearch()}
                        onIonInput={(event) => this.searchBeverages(event)}
                        onIonCancel={() => this.clearSearch()}
                        placeholder="Search by beverage name"></ion-searchbar>
                </ion-toolbar>}

            </ion-header>,

            <ion-content scrollX={false} scrollY={true} fullscreen={true}>
                <ion-header collapse="condense" translucent={true}>
                    <ion-toolbar>
                        <ion-title size="large">Caffeine Tracker</ion-title>
                    </ion-toolbar>
                    {Firebase.ios && <ion-toolbar>
                        <ion-searchbar
                            showCancelButton="never"
                            id="searchBar"
                            autocomplete="off"
                            autocorrect="off"
                            animated={true}
                            inputmode="text"
                            type="search"
                            value={this.query}
                            onIonClear={() => this.clearSearch()}
                            onIonInput={(event) => this.searchBeverages(event)}
                            onIonCancel={() => this.clearSearch()}
                            placeholder="Search by beverage name"></ion-searchbar>
                    </ion-toolbar>}
                </ion-header>
                <ion-grid fixed>
                    <ion-row>
                        <ion-col size="12" size-md="6">
                            {this.renderContent()}
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </ion-content>,
            <ion-footer>
                <ion-toolbar>
                    <ion-title>
                        <ion-item lines="none">
                            <ion-label>
                                <h2 style={{
                                    'font-size': '16px',
                                    'font-weight': '500',
                                    'letter-spacing': '0.02em'
                                }}>{this.caffeineLevels >= 0.75 ? this.caffeineLevels >= 1 ? 'Unsafe levels!' : 'Approaching unsafe levels' : this.caffeineLevels <= 0 ? 'No intake tracked' : 'Current intake is safe'}</h2>
                            </ion-label>
                        </ion-item>
                    </ion-title>
                    <ion-buttons slot="end">
                        <ion-button fill="clear" onClick={() => this.clearIntake()}>CLEAR</ion-button>
                    </ion-buttons>
                    <ion-progress-bar color={this.caffeineLevels >= 0.75 ? 'danger' : 'success'} value={this.caffeineLevels}></ion-progress-bar>
                </ion-toolbar>
            </ion-footer>
        ];
    }

}