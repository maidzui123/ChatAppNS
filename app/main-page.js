import { createViewModel } from './main-view-model';
import { signIn } from './auth-service';

export function onNavigatingTo(args) {
  const page = args.object;
  page.bindingContext = createViewModel();
}

export async function onSignInButtonTap(args) {
  const page = args.object.page;
  const email = page.getViewById("email").text;
  const password = page.getViewById("password").text;
  const messageLabel = page.getViewById("messageLabel");

  try {
    const user = await signIn(email, password);
    messageLabel.text = "Sign-in successful!";
    console.log("User signed in successfully:", user);
  } catch (error) {
    messageLabel.text = "Sign-in failed: " + error.message;
    console.error("Sign-in error:", error);
  }
}
