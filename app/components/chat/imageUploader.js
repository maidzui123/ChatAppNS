import "@nativescript/core/globals";
import { ImageSource } from "@nativescript/core";
import "@nativescript/firebase-storage";
import { firebase } from "@nativescript/firebase-core";
import "@nativescript/firebase-database"; // Import the Realtime Database

self.onmessage = async function (message, viewModel) {
  const imagePath = message.data.imagePath;
  try {
    const imageSource = await ImageSource.fromFile(imagePath);
    if (!imageSource) {
      throw new Error("Failed to create ImageSource from selected image.");
    }
    const base64 = imageSource.toBase64String("png");
    if (base64) {
      self.postMessage({ success: true, base64 });
      const storageRef = firebase().storage().ref();
      const imageName = `image_${Date.now()}.jpg`;
      const imageRef = storageRef.child(imageName);
      await imageRef.putString(base64, "base64", {
        contentType: "image/jpeg",
      });
      await new Promise((resolve) => setTimeout(resolve, 12000));

      const imageUrl = await firebase()
        .storage()
        .ref(imageName)
        .getDownloadURL();

      await sendMessageWithImageUrl(imageUrl, message.data.chatId, message.data.senderId);
      // self.postMessage({ isSend: true });

    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    self.postMessage({ success: false, error });
  }
};

async function sendMessageWithImageUrl(imageUrl, chatId, senderId) {
  try {
    const newMessageRef = firebase()
      .database()
      .ref(`chats/${chatId}/messages`)
      .push();
    await newMessageRef.set({
      imageSrc: imageUrl,
      timestamp: new Date().toISOString(),
      senderId: senderId,
      type: "image",
    });
    console.log("Image message sent successfully");
  } catch (error) {
    console.error("Send image message error:", error);
  }
}
