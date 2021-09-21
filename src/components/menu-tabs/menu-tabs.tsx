import { Component, h, Element, Event, EventEmitter, State } from "@stencil/core";
import type { User } from "firebase/auth";
import type { DocumentData } from "firebase/firestore";
import type { AppUser } from "../../interfaces/app-user";
import type { Observable, Subscription } from "rxjs";

import { docData } from "rxfire/firestore";
import { doc } from "firebase/firestore";
import { authState } from "rxfire/auth";
import { Firebase } from "../../providers/firebase";
import { pathType } from "../../interfaces/constants";

@Component({
    tag: "menu-tabs",
    styleUrl: "menu-tabs.css"
})
export class MenuTabs {
    @Element() element: HTMLElement;
    private tabBar: HTMLIonTabBarElement;
    @Event() haptic: EventEmitter<any>;
    private authObservable: Observable<User>;
    private authSubscription: Subscription;
    @State() appUser: AppUser = null;
    private userObservable: Observable<DocumentData>;
    private userSubscription: Subscription;

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

    componentDidLoad() {
        setTimeout(async () => {
            this.tabBar = this.element.querySelector("#menuTab");
            this.tabBar.addEventListener("click", () => {
                this.haptic.emit();
            });
        }, 500);
    }

    render() {
        return [
            <ion-tabs hidden={!this.appUser}>
                <ion-tab tab="tab-caffeine">
                    <ion-nav></ion-nav>
                </ion-tab>
                <ion-tab tab="tab-coffee">
                    <ion-nav></ion-nav>
                </ion-tab>
                <ion-tab-bar slot="bottom" id="menuTab" translucent={true}>
                    <ion-tab-button tab="tab-caffeine">
                        <ion-icon name="fitness-outline"></ion-icon>
                        <ion-label>Caffeine</ion-label>
                    </ion-tab-button>
                    <ion-tab-button tab="tab-coffee">
                        <ion-icon name="cafe-outline"></ion-icon>
                        <ion-label>Coffee</ion-label>
                    </ion-tab-button>
                </ion-tab-bar>
            </ion-tabs>
        ];
    }
}