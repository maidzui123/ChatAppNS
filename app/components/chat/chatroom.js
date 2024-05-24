const {
  Observable,
  ObservableArray,
  fromObject,
  ImageSource,
} = require("@nativescript/core");
const { firebase } = require("@nativescript/firebase-core");
import * as imagePickerPlugin from "@nativescript/imagepicker";
import "@nativescript/core/globals";
import "@nativescript/firebase-storage";

const viewModel = fromObject({
  messages: new ObservableArray([]),
  messageText: "",
  chatId: "",
  currentUserId: "",
});

export function onPageLoaded(args) {
  const page = args.object;
  const context = page.navigationContext;
  if (context && context.chatId) {
    viewModel.messages.splice(0); // Clear existing messages
    viewModel.set("currentUserId", firebase().auth().currentUser.uid);
    viewModel.set("chatId", context.chatId);
    listenToMessages(context.chatId);
  }
  page.bindingContext = viewModel;
}

export function listenToMessages(chatId) {
  const messagesRef = firebase().database().ref(`chats/${chatId}/messages`);
  messagesRef.on("child_added", (snapshot) => {
    const message = snapshot.val();
    if (message && (message.text || message.imageSrc) && message.senderId) {
      viewModel.messages.push(message);
    } else {
      console.error("Invalid message data received:", message);
    }
  });
}

export function sendMessage() {
  const chatId = viewModel.get("chatId");
  const messageText = viewModel.get("messageText");
  if (messageText.trim() !== "") {
    const newMessageRef = firebase()
      .database()
      .ref(`chats/${chatId}/messages`)
      .push();
    newMessageRef
      .set({
        text: messageText,
        timestamp: new Date().toISOString(),
        senderId: firebase().auth().currentUser.uid,
        type: "text",
      })
      .then(() => {
        viewModel.set("messageText", ""); // Clear input field after sending
      })
      .catch((error) => {
        console.error("Send message error:", error);
      });
  }
}

export function selectImage() {
  const context = imagePickerPlugin.create({
    mode: "single",
  });

  context
    .authorize()
    .then(() => {
      return context.present();
    })
    .then(async (selection) => {
      const selected = selection.length > 0 ? selection[0] : null;
      if (selected) {
        // uploadImageToFirebase(selected)
        const worker = new Worker("imageUploader.js");
        worker.postMessage({ imagePath: selected.path });
        // handle incoming messages from the worker
        worker.onmessage = function (message) {
          if (message.data.success) {
            uploadBase64ToFirebase(message.data.base64);
          } else {
            console.error("Image upload error:", msg.data.error);
          }
        };
      }
    })
    .catch((error) => {
      console.error("Image selection error:", error);
    });
}

async function uploadBase64ToFirebase(base64String) {
  try{
    const storageRef = firebase().storage().ref();
  const imageName = `image_${Date.now()}.jpg`;
  const imageRef = storageRef.child(imageName);

  // Upload base64 string to Firebase Storage
  const snapshot = await imageRef.putString(base64String, "base64", {
    contentType: "image/jpeg",
  });
  await new Promise(resolve => setTimeout(resolve, 10000));

  const imageUrl = await firebase().storage().ref(imageName).getDownloadURL();
  console.log("🚀 ~ uploadBase64ToFirebase ~ imageUrl:", imageUrl);
  await sendMessageWithImageUrl(imageUrl);
  }
  catch(error){
    console.error("Upload base64 image error:", error);
  }
}

async function sendMessageWithImageUrl(imageUrl) {
  try {
    console.log("🚀 ~ sendMessageWithImageUrl ~ imageUrl:", imageUrl);

    const chatId = viewModel.get("chatId");
    const newMessageRef = firebase()
      .database()
      .ref(`chats/${chatId}/messages`)
      .push();
    await newMessageRef.set({
      imageSrc: imageUrl,
      timestamp: new Date().toISOString(),
      senderId: firebase().auth().currentUser.uid,
      type: "image",
    });
    console.log("Image message sent successfully");
  } catch (error) {
    console.error("Send image message error:", error);
  }
}