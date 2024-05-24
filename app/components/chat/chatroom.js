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

function scrollToBottom(page) {
  const listView = page.getViewById("messagesListView");
  const messages = page.bindingContext.get("messages");
  if (messages.length > 0) {
    listView.scrollToIndex(messages.length - 1);
  }
}

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
  page.getViewById("messagesListView").once("loaded", () => {
    scrollToBottom(page);
  });
  viewModel.messages.on(ObservableArray.changeEvent, () => {
    setTimeout(() => {
      scrollToBottom(page);
    }, 0);
  });
}

export function listenToMessages(chatId) {
  const messagesRef = firebase().database().ref(`chats/${chatId}/messages`);
  messagesRef.on("child_added", (snapshot) => {
    const message = snapshot.val();
  
    if (message && (message.text || message.imageSrc) && message.senderId) {
      if (viewModel.messages.length > 0) {
        const lastMessage = viewModel.messages.getItem(viewModel.messages.length - 1);
        if (lastMessage.isUploading) {
          viewModel.messages.pop();
        }
      }
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
        worker.postMessage({
          imagePath: selected.path,
          chatId: viewModel.get("chatId"),
          senderId: viewModel.get("currentUserId"),
        });
        // handle incoming messages from the worker
        worker.onmessage = function (message) {
          if (message.data.success) {
            console.log(
              "🚀 ~ .then ~ message.data.success:",
              message.data.success
            );
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
  try {
    console.log(
      "🚀 ~ file: chatroom.js ~ line 136 ~ uploadBase64ToFirebase ~ base64String",
      base64String
    );
    // const storageRef = firebase().storage().ref();
    // const imageName = `image_${Date.now()}.jpg`;
    // const imageRef = storageRef.child(imageName);

    const placeholderMessage = {
      senderId: viewModel.get("currentUserId"),
      imageSrc: `data:image/jpeg;base64,${base64String}`,
      isUploading: true,
      type: "image",
    };
    viewModel.messages.push(placeholderMessage);

    // await imageRef.putString(base64String, "base64", {
    //   contentType: "image/jpeg",
    // });
    // await new Promise((resolve) => setTimeout(resolve, 12000));

    // const imageUrl = await firebase().storage().ref(imageName).getDownloadURL();

    // await sendMessageWithImageUrl(imageUrl);
  } catch (error) {
    console.error("Upload base64 image error:", error);
  }
}

// async function sendMessageWithImageUrl(imageUrl) {
//   try {
//     const chatId = viewModel.get("chatId");
//     const newMessageRef = firebase()
//       .database()
//       .ref(`chats/${chatId}/messages`)
//       .push();
//     await newMessageRef.set({
//       imageSrc: imageUrl,
//       timestamp: new Date().toISOString(),
//       senderId: firebase().auth().currentUser.uid,
//       type: "image",
//     });
//     viewModel.messages.pop();
//     console.log("Image message sent successfully");
//   } catch (error) {
//     console.error("Send image message error:", error);
//   }
// }
