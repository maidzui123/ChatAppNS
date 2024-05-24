/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import { Application } from '@nativescript/core';

import { firebase } from '@nativescript/firebase-core';
Application.run({ moduleName: 'app-root' })

async function initializeFirebase() {
  try {
    const defaultApp = await firebase().initializeApp();
    console.log("Firebase initialization successful:", defaultApp);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

initializeFirebase();
/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

