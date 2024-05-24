import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-database';

export async function writeData(path, data) {
  try {
    const db = firebase().database();
    await db.ref(path).set(data);
    console.log('Data written successfully to path:', path);
  } catch (error) {
    console.error('Error writing data to Firebase Realtime Database:', error);
  }
}

export async function readData(path) {
    try {
      const db = firebase().database();
      const snapshot = await db.ref(path).once('value');
      const data = snapshot.val();
      console.log('Data read successfully from path:', path, data);
      return data;
    } catch (error) {
      console.error('Error reading data from Firebase Realtime Database:', error);
    }
  }