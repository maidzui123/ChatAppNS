const { Observable } = require('@nativescript/core/data/observable');
const { Frame } = require('@nativescript/core/ui/frame');
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-auth';

const viewModel = new Observable({
    email: '',
    password: ''
});

export function onPageLoaded(args) {
    const page = args.object;
    page.bindingContext = viewModel;
}

viewModel.loginUser = async function() {
    try {
        const userCredential = await firebase().auth().signInWithEmailAndPassword(viewModel.get('email'), viewModel.get('password'));
        console.log("User signed in:", userCredential.user);
        Frame.topmost().navigate("components/userlist/userlist");
    } catch (error) {
        console.error("Sign-in error:", error.message);
    }
};

viewModel.navigateToRegister = function() {
    Frame.topmost().navigate("components/auth/register");
};