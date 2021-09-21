# CoffeeMe
A fun and useful coffee app. This is a real world example of a real time app that can work with data offline. Authentication state is persisted for a better user experience. State management, object storage, file storage, authentication, and data streaming are powered by Firebase. Input data is saved in real time to firestore and streamed back to the app, so no need for a save button.

## Setup
1. git clone https://github.com/cambronjay/coffee-app.git
2. npm install
3. npm run buildNativeDebug (Debug build) or npm run buildNativeProd (Production build)

## Running the app on a device
-npm run openios (this will open the app in Xcode)
-npm run openandroid (this will open the app in Android Studio)
-Note you will need to be signed in with your Apple ID or Google Account on your emulator or device, because this app uses Sign in with Apple and Sign in with Google
-Deploy to your favorite emulator or physical device!

## Running the app in a browser
-npm start
-utilize safari's responsive design mode or chrome's device toolbar to emulate a mobile device
