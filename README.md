# CoffeeMe
A fun and useful coffee app. This is a real world example of a real time app that can work with data offline. Authentication state is persisted for a better user experience. State management, object storage, file storage, authentication, file upload, and data streaming are powered by Firebase.

## Setup
1. git clone https://github.com/cambronjay/coffee-app.git
2. npm install
3. npm run buildNativeDebug (Debug build) or npm run buildNativeProd (Production build)
*Note you will need to run buildNativeDebug or buildNativeProd before pushing to a native device or emulator. 
*Note you may need to swap out the bundle id/package name of com.jaycambron.coffeeme and use your own signing certificate etc.
## Running the app on a device
-npm run openios (this will open the app in Xcode)
-npm run openandroid (this will open the app in Android Studio)
-Deploy to your favorite emulator or physical device
*Note the test account login info: test@test.com and a password of test1234

## Running the app in a browser
-npm start
-utilize safari's responsive design mode or chrome's device toolbar to emulate a mobile device
*Native features like Camera will not work in the browser
