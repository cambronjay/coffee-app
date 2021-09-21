import '@ionic/core';
import { Component, h, forceUpdate, Element, Listen, Event, EventEmitter } from '@stencil/core';
import type { User } from 'firebase/auth';
import type { Observable, Subscription } from "rxjs";

import { Firebase } from '../../providers/firebase';
import { authState } from 'rxfire/auth';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.css'
})
export class AppRoot {
    @Event() authenticated: EventEmitter<boolean>;
    private authObservable: Observable<User>;
    private authSubscription: Subscription;
    @Element() element: HTMLElement;
    @Listen('ionRouteWillChange', { target: 'window' })
    routeWillChange() {
        forceUpdate(this.element);
    }

    @Listen('haptic', { target: 'window' })
    handleHaptic() {
        try {
            Haptics.impact({
                style: ImpactStyle.Heavy
            });
        } catch (error) {
            return;
        }
    }

    @Listen('hideSplashScreen', { target: 'window' })
    async handleSplashScreen(event: any) {
        if (event.detail.hide) {
            try {
                await SplashScreen.hide();
            } catch (error) {

            }
        }
    }

    disconnectedCallback() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    async componentWillLoad() {
        return await Firebase.initialize();
    }

    componentDidLoad() {
        this.authObservable = authState(Firebase.auth);
        this.authSubscription = this.authObservable.subscribe(async (auth: User) => {
            if (auth) {
                await this.updateGuard('/', '/intro');
                forceUpdate(this.element);
            }
            if (!auth) {
                await this.updateGuard('*', '/intro');
                forceUpdate(this.element);
            }
        });
    }

    async updateGuard(from: string, to: string): Promise<any> {
        const routeRedirect = this.element.querySelector('ion-route-redirect');
        const router = this.element.querySelector('ion-router');
        if (routeRedirect) {
            router.removeChild(routeRedirect);
            const updatedRouteRedirect = document.createElement('ion-route-redirect');
            updatedRouteRedirect.setAttribute('from', from);
            updatedRouteRedirect.setAttribute('to', to);
            router.appendChild(updatedRouteRedirect);
            return await Promise.resolve('success');
        }
        if (!routeRedirect) {
            const updatedRouteRedirect = document.createElement('ion-route-redirect');
            updatedRouteRedirect.setAttribute('from', from);
            updatedRouteRedirect.setAttribute('to', to);
            router.appendChild(updatedRouteRedirect);
            return await Promise.resolve('success');
        }

    }

    render() {
        return (
            <ion-app>
                <ion-router useHash={false}>
                    <ion-route url="/intro" component="screen-intro"></ion-route>
                    <ion-route component="menu-tabs">
                        <ion-route url='/caffeine' component='tab-caffeine'>
                            <ion-route component='screen-caffeine'></ion-route>
                        </ion-route>
                        <ion-route url='/coffee' component='tab-coffee'>
                            <ion-route component='screen-coffee'></ion-route>
                        </ion-route>
                    </ion-route>
                    <ion-route-redirect from='/' to='/intro'></ion-route-redirect>
                </ion-router>
                <ion-router-outlet animated={true} mode={Firebase.ios ? "ios" : "md"} id="routerOutlet"></ion-router-outlet>
            </ion-app>
        );
    }
}