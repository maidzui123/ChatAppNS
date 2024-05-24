// const { Observable } = require('@nativescript/core/data/observable');
// const { Frame } = require('@nativescript/core/ui/frame');
// import { firebase } from '@nativescript/firebase-core';
// import '@nativescript/firebase-auth';

// const viewModel = new Observable({
//     email: '',
//     password: ''
// });

// export function onPageLoaded(args) {
//     const page = args.object;
//     page.bindingContext = viewModel;
// }

// viewModel.registerUser = async function() {
//     try {
//         const userCredential = await firebase().auth().createUserWithEmailAndPassword(viewModel.get('email'), viewModel.get('password'));
//         console.log("User registered:", userCredential.user);
//         Frame.topmost().navigate("components/chat/chatlist");
//     } catch (error) {
//         console.error("Registration error:", error.message);
//     }
// };

// app/components/auth/register.js
const { Observable } = require('@nativescript/core');
const { firebase } = require('@nativescript/firebase-core');
const { Frame } = require('@nativescript/core');

export function onPageLoaded(args) {
    const page = args.object;
    const viewModel = new Observable();
    viewModel.email = "";
    viewModel.password = "";

    viewModel.registerUser = async function() {
        try {
            const userCredential = await firebase().auth().createUserWithEmailAndPassword(viewModel.email, viewModel.password);
            console.log("User registered:", userCredential.user);

            // Sau khi đăng ký, thêm thông tin người dùng vào Realtime Database
            const usersRef = firebase().database().ref(`users/${userCredential.user.uid}`);
            await usersRef.set({
                email: viewModel.email,
                id: userCredential.user.uid
            });

            // Điều hướng đến danh sách người dùng
            Frame.topmost().navigate("components/userlist/userlist");
        } catch (error) {
            console.error("Registration error:", error);
        }
    };

    page.bindingContext = viewModel;
}
