import "@nativescript/core/globals";
import { ImageSource } from "@nativescript/core";
import "@nativescript/firebase-storage";
import { firebase } from "@nativescript/firebase-core";
import "@nativescript/firebase-database"; // Import the Realtime Database
import { knownFolders, path } from "@nativescript/core";
self.onmessage = async function (message, viewModel) {
  const imagePath = message.data.imagePath;
  try {
    const imageSource = await ImageSource.fromFile(imagePath);
    // let resizedBase64 = resizeImage(imageSource, 200, 200, 0.5);

    if (!imageSource) {
      throw new Error("Failed to create ImageSource from selected image.");
    }
    const base64 = await resizeImage(imageSource, 100, 100, 0.1);
    if (base64) {
      self.postMessage({ success: true, base64 });
      const storageRef = firebase().storage().ref();
      const imageName = `image_${Date.now()}.jpg`;
      const imageRef = storageRef.child(imageName);
      console.log("Image is uploading to Firebase Storage...");
      await imageRef.putString(base64, "base64", {
        contentType: "image/jpeg",
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log("Image uploaded successfully");
      const imageUrl = await firebase()
        .storage()
        .ref(imageName)
        .getDownloadURL();
      await sendMessageWithImageUrl(
        imageUrl,
        message.data.chatId,
        message.data.senderId
      );
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    self.postMessage({ success: false, error });
  }
};

async function resizeImage(imageSrc, maxWidth, maxHeight, quality) {
  let width = imageSrc.width;
  let height = imageSrc.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height *= maxWidth / width));
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width *= maxHeight / height));
      height = maxHeight;
    }
  }

  let resizedImageSource = new ImageSource();
  resizedImageSource.setNativeSource(imageSrc.ios || imageSrc.android);

  // Create a temporary file to store the resized image
  let folder = knownFolders.temp();
  let fileName = "resizedImage.jpg";
  let filePath = path.join(folder.path, fileName);

  // Save the resized image to the file system with the desired quality
  resizedImageSource.saveToFile(filePath, "jpeg", quality);

  // Load the resized image from the file system
  let finalImageSource = ImageSource.fromFileSync(filePath);

  // Convert the resized image to base64
  let base64String = finalImageSource.toBase64String("jpeg");

  return base64String;
}

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
