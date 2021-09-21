import type { Auth } from "firebase/auth";

import { initializeApp, FirebaseApp } from "firebase/app";
import { browserLocalPersistence, initializeAuth } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED, Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { Device, DeviceInfo } from "@capacitor/device";

class FirebaseController {
    private app: FirebaseApp;
    public auth: Auth;
    public firestore: Firestore;
    public storage: FirebaseStorage;
    public functions: Functions;
    public web: boolean = false;
    public ios: boolean = false;
    public android: boolean = false;

    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyDK3KRcY3Aw2BWTd_XN7FcWIESGTAkznvY",
            authDomain: "coffee-fdc50.firebaseapp.com",
            projectId: "coffee-fdc50",
            storageBucket: "coffee-fdc50.appspot.com",
            messagingSenderId: "1096523140277",
            appId: "1:1096523140277:web:d7623cbb54e56cf5c682fc",
            measurementId: "G-KWCLJ50T0E"
        };

        this.app = initializeApp(firebaseConfig, "CoffeeMe");
    }

    async initialize() {
        this.firestore = initializeFirestore(this.app, {
            cacheSizeBytes: CACHE_SIZE_UNLIMITED,
            experimentalAutoDetectLongPolling: true,
        });
        await enableIndexedDbPersistence(this.firestore, {
            forceOwnership: true,
        });
        this.auth = initializeAuth(this.app, {
            persistence: browserLocalPersistence
        });
        this.storage = getStorage(this.app);
        this.functions = getFunctions(this.app);
        const deviceInfo: DeviceInfo = await Device.getInfo();
        this.web = deviceInfo.platform === "web" ? true : false;
        if (!this.web) {
            this.ios = deviceInfo.platform === "ios" || deviceInfo.operatingSystem === "ios" ? true : false;
            this.android = deviceInfo.platform === "android" || deviceInfo.operatingSystem === "android" ? true : false;
        }
        return await Promise.resolve();
    }
}

export const Firebase = new FirebaseController();