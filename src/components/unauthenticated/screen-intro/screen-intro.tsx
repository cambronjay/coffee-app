import { Component, State, h, Element, Event, EventEmitter, getAssetPath, Prop } from '@stencil/core';
import { createAnimation, Animation } from '@ionic/core';
import type { User } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';
import type { AppUser } from '../../../interfaces/app-user';
import type { Observable, Subscription } from "rxjs";

import { Firebase } from '../../../providers/firebase';
import { modalController } from '@ionic/core'
import { pathType } from '../../../interfaces/constants';
import { doc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from "firebase/auth";
import { wait } from '../../../providers/utils';
import { alertController } from '@ionic/core';
import { authState } from 'rxfire/auth';
import { docData } from 'rxfire/firestore';

@Component({
    tag: 'screen-intro',
    styleUrl: 'screen-intro.css',
    assetsDirs: ['assets']
})
export class ScreenIntro {
    @Prop() routerNav: HTMLIonRouterElement;
    private slides: HTMLIonSlidesElement;
    @State() componentLoaded: boolean;
    @State() savingToFirebase: boolean = false;
    @Element() element: HTMLElement;
    @Event() haptic: EventEmitter<any>;
    private authObservable: Observable<User>;
    private authSubscription: Subscription;
    private userObservable: Observable<DocumentData>;
    private userSubscription: Subscription;
    @State() hideElements: boolean = false;
    @Event() hideSplashScreen: EventEmitter<any>;

    connectedCallback() {
        this.routerNav = document.querySelector('ion-router');
    }

    disconnectedCallback() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    componentDidLoad() {
        this.authObservable = authState(Firebase.auth);
        this.authSubscription = this.authObservable.subscribe((auth: User) => {
            if (auth) {
                this.userObservable = docData(doc(Firebase.firestore, `${pathType.users}/${Firebase.auth.currentUser.uid}`));
                this.userSubscription = this.userObservable.subscribe(async (appUser: AppUser) => {
                    if (appUser && appUser.coffee) {
                        await this.routeSignIn();
                    }
                });
            }
            if (!auth) {
                this.startAnimationLoop();
            }
        });
    }

    async startAnimationLoop() {
        if (!this.savingToFirebase) {
            setTimeout(async () => {
                this.hideSplashScreen.emit({ hide: true });
                this.componentLoaded = true;
                await wait(100);
                this.slides = this.element.querySelector('ion-slides');
                const imageAnimation: Animation = createAnimation()
                    .addElement(this.element.querySelector('#slideIcon'))
                    .duration(800)
                    .easing('cubic-bezier(0.455, 0.03, 0.515, 0.955)')
                    .direction('normal')
                    .iterations(1)
                    .fromTo('transform', 'translateY(100%)', 'translateY(0%)')
                    .fromTo('visibility', 'hidden', 'visible')
                    .fromTo('opacity', '0', '1')
                    .afterAddClass('showElement')
                    .afterRemoveClass('hideElement')
                const textAnimation: Animation = createAnimation()
                    .addElement(this.element.querySelector('#slideTitle'))
                    .addElement(this.element.querySelector('#slideText'))
                    .addElement(this.element.querySelector('#signInButton'))
                    .duration(400)
                    .direction('normal')
                    .iterations(1)
                    .fromTo('visibility', 'hidden', 'visible')
                    .fromTo('opacity', '0', '1')
                    .afterAddClass('showElement')
                    .afterRemoveClass('hideElement')
                await imageAnimation.play();
                await textAnimation.play();
            }, 500);
        }
    }

    async signIn() {
        this.haptic.emit();
        await this.slides.lockSwipes(true);
        this.savingToFirebase = true;
        const modal = await modalController.create({
            component: 'modal-login',
            swipeToClose: false,
            presentingElement: this.element.closest('ion-router-outlet')
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data && data.email.length > 0) {
            try {
                await signInWithEmailAndPassword(Firebase.auth, data.email, data.password);
            } catch (error) {
                await this.slides.lockSwipes(false);
                this.savingToFirebase = false;
                const alert = await alertController.create({
                    backdropDismiss: false,
                    header: 'Oops',
                    message: 'Please sign in again.',
                    buttons: [
                        { text: 'Ok' }
                    ]
                });
                await alert.present();
            }
        } else {
            await this.slides.lockSwipes(false);
            this.savingToFirebase = false;
        }
    }

    async routeSignIn() {
        const routerNavCtrl: HTMLIonRouterElement = await (this.routerNav as any).componentOnReady();
        this.hideElements = true;
        await routerNavCtrl.push('/caffeine');
        this.slides.lockSwipes(false);
        this.savingToFirebase = false;
        this.hideElements = false;
    }

    renderSlides() {
        return (
            <ion-slides pager={true}>
                <ion-slide>
                    <img src={getAssetPath('../assets/img/slide-one.svg')} id="slideIcon" class="slideVector hideElement" />
                    <h1 class="slide-title hideElement" id="slideTitle">CoffeeMe</h1>
                    <p class="hideElement" id="slideText">Pure Enjoyment!</p>
                </ion-slide>
                <ion-slide>
                    <img src={getAssetPath('../assets/img/slide-two.svg')} class="slideVector" />
                    <h1 class="slide-title">Track Caffeine</h1>
                    <p>Stay safe and know your limit</p>
                </ion-slide>
                <ion-slide>
                    <img src={getAssetPath('../assets/img/slide-three.svg')} class="slideVector" />
                    <h1 class="slide-title">Coffee Profile</h1>
                    <p>Track your taste in coffee</p>
                </ion-slide>
            </ion-slides>
        )
    }

    render() {
        return [
            <ion-header hidden={this.hideElements} class="ion-no-border">
                <ion-toolbar>
                </ion-toolbar>
            </ion-header>,
            <ion-content hidden={this.hideElements} scrollX={false} scrollY={false}>
                {this.componentLoaded ? this.renderSlides() : <div></div>}
            </ion-content>,
            <ion-footer hidden={this.hideElements} class="ion-no-border">
                <ion-toolbar style={{ 'text-align': 'center' }}>
                    <ion-button class="ion-margin-bottom hideElement" id="signInButton" disabled={this.savingToFirebase} shape="round" color="primary" onClick={() => this.signIn()}>
                        <ion-spinner hidden={!this.savingToFirebase} duration={750} color="light" name="crescent"></ion-spinner>
                        <ion-text>{this.savingToFirebase ? '' : "Sign in"}</ion-text>
                    </ion-button>
                </ion-toolbar>
            </ion-footer>
        ];
    }
}