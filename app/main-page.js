// import { createViewModel } from './main-view-model';
// import { signIn } from './auth-service';

// export function onNavigatingTo(args) {
//   const page = args.object;
//   page.bindingContext = createViewModel();
// }

// export async function onSignInButtonTap(args) {
//   const page = args.object.page;
//   const email = page.getViewById("email").text;
//   const password = page.getViewById("password").text;
//   const messageLabel = page.getViewById("messageLabel");

//   try {
//     const user = await signIn(email, password);
//     messageLabel.text = "Sign-in successful!";
//     console.log("User signed in successfully:", user);
//   } catch (error) {
//     messageLabel.text = "Sign-in failed: " + error.message;
//     console.error("Sign-in error:", error);
//   }
// }

// import { Frame } from "@nativescript/core";
// function onNavigatingTo(args) {
//     const page = args.object;
//     // Any initialization code for the main page can go here
// }

// function onGoToLoginTap() {
//     Frame.topmost().navigate("components/auth/login");
// }

// exports.onNavigatingTo = onNavigatingTo;
// exports.onGoToLoginTap = onGoToLoginTap;

import { writeData, readData } from './database-service';

export function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = {};
}

export async function onWriteDataTap(args) {
  try {
    await writeData('/example/path', { exampleKey: 'exampleValue' });
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

export async function onReadDataTap(args) {
  try {
    const data = await readData('/example/path');
    console.log('Read data:', data);
  } catch (error) {
    console.error('Error reading data:', error);
  }
}

const frameModule = require('@nativescript/core/ui/frame');

export function onPageLoaded(args) {
    const page = args.object;
    page.bindingContext = { navigateToLogin };
}

export function navigateToLogin() {
  console.log('Navigating to login page');
    frameModule.Frame.topmost().navigate({
        moduleName: 'components/auth/login',
        animated: true,
        transition: {
            name: 'slideLeft',
            duration: 300,
            curve: 'easeIn'
        }
    });
}
