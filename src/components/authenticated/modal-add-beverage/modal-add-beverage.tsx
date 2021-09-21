import type { beverageFormInput } from '../../../interfaces/app-user';

import { Component, Element, h, State, getAssetPath } from '@stencil/core';
import { wait } from '../../../providers/utils';
import { decode } from "base64-arraybuffer";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ShortUniqueId from 'short-unique-id';
import { Camera, CameraResultType, CameraDirection, CameraSource } from '@capacitor/camera';
import { alertController } from '@ionic/core'
import { Firebase } from '../../../providers/firebase';
import AutoNumeric from 'autonumeric';

@Component({
    tag: 'modal-add-beverage',
    styleUrl: 'modal-add-beverage.css',
    assetsDirs: ['assets']
})

export class ModalAddBeverage {
    @Element() element: HTMLElement;
    @State() beverage: beverageFormInput = {
        title: {
            value: null,
            valid: false,
        },
        description: {
            value: null,
            valid: false,
        },
        caffeinePerUnit: {
            value: null,
            valid: false,
        },
        servingsPerUnit: {
            value: null,
            valid: false,
        },
        unitVolume: {
            value: null,
            valid: false,
        },
        photo: '',
    }
    @State() uploading: boolean = false;
    @State() buffer: number = 0.0;

    async dismiss(data?: any) {
        (this.element.closest('ion-modal') as any).dismiss(data);
    }

    async componentDidLoad() {
        setTimeout(async () => {
            const caffeinePerUnitInput: HTMLIonInputElement = this.element.querySelector("#caffeinePerUnitInput");
            const caffeinePerUnitInputElement = await caffeinePerUnitInput.getInputElement();
            new AutoNumeric(caffeinePerUnitInputElement, 'numericPos').set(null, { digitGroupSeparator: "", decimalPlaces: 0, emptyInputBehavior: 'null', maximumValue: '500' });
            const servingsPerUnitInput: HTMLIonInputElement = this.element.querySelector("#servingsPerUnitInput");
            const servingsPerUnitInputElement = await servingsPerUnitInput.getInputElement();
            new AutoNumeric(servingsPerUnitInputElement, 'numericPos').set(null, { digitGroupSeparator: "", decimalPlaces: 0, emptyInputBehavior: 'null', maximumValue: '500' });
            const unitVolumeInput: HTMLIonInputElement = this.element.querySelector("#unitVolumeInput");
            const unitVolumeInputElement = await unitVolumeInput.getInputElement();
            new AutoNumeric(unitVolumeInputElement, 'numericPos').set(null, { digitGroupSeparator: "", decimalPlaces: 0, emptyInputBehavior: 'null', maximumValue: '500' });
        }, 500);
    }

    async addPhoto() {
        try {
            this.uploading = true;
            const permissionGranted = await Camera.checkPermissions();
            if (permissionGranted.camera === 'denied') {
                const alert = await alertController.create({
                    backdropDismiss: false,
                    header: 'Camera Issue',
                    message: 'Camera permissions needed',
                    buttons: [
                        { text: 'Ok' }
                    ]
                });
                await alert.present();
            } else {
                try {
                    const image = await Camera.getPhoto({
                        quality: 75,
                        allowEditing: false,
                        source: CameraSource.Prompt,
                        direction: CameraDirection.Rear,
                        resultType: CameraResultType.Base64
                    });
                    await wait(100);
                    if (image && image.base64String.length > 0) {
                        const blob = new Blob([new Uint8Array(decode(image.base64String))], {
                            type: `image/jpeg`,
                        });
                        const uuid = new ShortUniqueId({
                            length: 20
                        });
                        const photoID = uuid();
                        const uploadPhoto = uploadBytesResumable(ref(Firebase.storage, `users/${Firebase.auth.currentUser.uid}/${photoID}.jpeg`), blob, {
                            contentType: 'image/jpeg'
                        });
                        uploadPhoto.on('state_changed',
                            (snapshot) => {
                                this.buffer = (snapshot.bytesTransferred / snapshot.totalBytes);
                            },
                            async () => {
                                this.uploading = false;
                                const alert = await alertController.create({
                                    backdropDismiss: false,
                                    header: 'Upload Issue',
                                    message: 'Please take the photo again.',
                                    buttons: [
                                        { text: 'Ok' }
                                    ]
                                });
                                await alert.present();
                            },
                            async () => {
                                try {
                                    const downloadURL = await getDownloadURL(uploadPhoto.snapshot.ref);
                                    this.beverage = {
                                        ...this.beverage,
                                        photo: downloadURL
                                    }
                                } catch (error) {

                                }
                                this.uploading = false;
                            }
                        );
                    }
                } catch (error) {
                    this.uploading = false;
                    if (!error.message || !error.message.includes('cancelled')) {
                        const alert = await alertController.create({
                            backdropDismiss: false,
                            header: 'Oops we hit a snag',
                            message: 'Please take the photo again.',
                            buttons: [
                                { text: 'Ok' }
                            ]
                        });
                        await alert.present();
                    }
                }
            }
        } catch (error) {
            const alert = await alertController.create({
                backdropDismiss: false,
                header: 'Permission Error',
                message: 'Please enable camera permissions.',
                buttons: [
                    { text: 'Ok' }
                ]
            });
            await alert.present();
        }
    }

    async handleInput(event: any, propertyName: string) {
        this.beverage = {
            ...this.beverage,
            [propertyName]: {
                value: event.target.value,
                valid: !!event.target.value
            }
        }
    }

    private validForm(): boolean {
        if (!this.beverage.title.valid) return false;
        if (!this.beverage.description.valid) return false;
        if (!this.beverage.caffeinePerUnit.valid) return false;
        if (!this.beverage.servingsPerUnit.valid) return false;
        if (!this.beverage.unitVolume.valid) return false;
        return true;
    }

    render() {
        return [
            <ion-header translucent={true}>
                <ion-toolbar>
                    <ion-title>
                        Add Beverage
                    </ion-title>
                    <ion-buttons slot="end">
                        <ion-button onClick={() => this.dismiss()}>
                            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>,
            <ion-progress-bar hidden={!this.uploading} type="determinate" value={this.buffer} buffer={this.buffer} color="tertiary" ></ion-progress-bar>,

            <ion-content scrollX={false} scrollY={true}>
                <ion-card>
                    <ion-card-header style={{ 'padding': '0' }}>
                        <ion-item lines="full" style={{ '--min-height': '85px' }}>
                            <ion-avatar slot="start" style={{
                                'width': '65px',
                                'height': '65px'
                            }}>
                                <ion-img src={this.beverage.photo.length > 0 ? this.beverage.photo : getAssetPath('../assets/img/placeholder.png')}></ion-img>
                            </ion-avatar>
                        </ion-item>
                    </ion-card-header>
                    <ion-card-content style={{
                        'flex': '1 1 auto',
                        'padding': '0'
                    }}>
                        <ion-item>
                            <ion-label position="stacked">
                                Name
                            </ion-label>
                            <ion-input
                                value={this.beverage.title.value}
                                type="text"
                                inputmode="text"
                                spellcheck={false}
                                autocomplete="off"
                                minlength={1}
                                autocorrect="on"
                                autocapitalize="on"
                                debounce={500}
                                onIonInput={(event: any) => this.handleInput(event, 'title')}
                                placeholder="vanilla latte"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">
                                Description
                            </ion-label>
                            <ion-input
                                value={this.beverage.description.value}
                                type="text"
                                inputmode="text"
                                spellcheck={false}
                                autocomplete="off"
                                minlength={1}
                                autocorrect="on"
                                autocapitalize="on"
                                debounce={500}
                                onIonInput={(event: any) => this.handleInput(event, 'description')}
                                placeholder="milk and espresso"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">
                                Caffeine per beverage in mg
                            </ion-label>
                            <ion-input
                                id="caffeinePerUnitInput"
                                value={this.beverage.caffeinePerUnit.value}
                                type="tel"
                                inputmode="tel"
                                spellcheck={false}
                                autocomplete="off"
                                minlength={1}
                                autocorrect="off"
                                autocapitalize="off"
                                debounce={500}
                                onIonInput={(event: any) => this.handleInput(event, 'caffeinePerUnit')}
                                placeholder="75"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">
                                Servings per beverage
                            </ion-label>
                            <ion-input
                                id="servingsPerUnitInput"
                                value={this.beverage.servingsPerUnit.value}
                                type="tel"
                                inputmode="tel"
                                spellcheck={false}
                                autocomplete="off"
                                minlength={1}
                                autocorrect="off"
                                autocapitalize="off"
                                debounce={500}
                                onIonInput={(event: any) => this.handleInput(event, 'servingsPerUnit')}
                                placeholder="1"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">
                                Beverage volume in fl oz
                            </ion-label>
                            <ion-input
                                id="unitVolumeInput"
                                value={this.beverage.unitVolume.value}
                                type="tel"
                                inputmode="tel"
                                spellcheck={false}
                                autocomplete="off"
                                minlength={1}
                                autocorrect="off"
                                autocapitalize="off"
                                debounce={500}
                                onIonInput={(event: any) => this.handleInput(event, 'unitVolume')}
                                placeholder="8"></ion-input>
                        </ion-item>
                    </ion-card-content>
                    <ion-row>
                        <ion-col>
                            <ion-item lines="none">
                                <ion-button shape="round" size="small" slot="start" onClick={() => this.addPhoto()}>ADD PHOTO</ion-button>
                            </ion-item>
                        </ion-col>
                    </ion-row>
                </ion-card>
            </ion-content>,
            <ion-footer>
                <ion-button color="secondary" class="ion-no-margin ion-no-padding ion-margin-bottom primary-action"
                    disabled={!this.validForm()} onClick={() => this.dismiss({
                        beverage: this.beverage
                    })} fill={!this.validForm() ? "outline" : "solid"} expand="full">
                    Save
                </ion-button>
            </ion-footer>
        ];
    }
}