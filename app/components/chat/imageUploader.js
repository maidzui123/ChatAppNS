import "@nativescript/core/globals";
import { knownFolders, File } from "@nativescript/core/file-system";
import { ImageSource } from "@nativescript/core";
self.onmessage = async function (message) {
  const imagePath = message.data.imagePath;
  try {
    const imageSource = await ImageSource.fromFile(imagePath);
    if (!imageSource) {
      throw new Error("Failed to create ImageSource from selected image.");
    }
    const base64 = imageSource.toBase64String("png");
    if (base64) {
      self.postMessage({ success: true, base64 });
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    self.postMessage({ success: false, error });
  }
};
