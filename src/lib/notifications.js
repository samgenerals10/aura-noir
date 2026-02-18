// src/lib/notifications.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase Cloud Messaging (FCM) - Push notifications service.
// Sends notifications to users even when the app is closed.
//
// SETUP REQUIRED:
// 1. Enable Cloud Messaging in Firebase Console
// 2. Get VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
// 3. Add VAPID key to .env as VITE_FIREBASE_VAPID_KEY
// 4. Create firebase-messaging-sw.js in public/ folder (service worker)
//
// CONNECTIONS:
//   → src/firebase/firebase.js  (Firebase app)
//   → public/firebase-messaging-sw.js  (service worker for background notifications)
// ─────────────────────────────────────────────────────────────────────────────

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '@/firebase/firebase';
import { toast } from 'sonner';

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// VAPID key from Firebase Console
// Get this from: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// ─── REQUEST NOTIFICATION PERMISSION ──────────────────────────────────────────
// Asks user for permission to send notifications.
// Returns FCM token if granted, null if denied.
export async function requestNotificationPermission() {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }
    
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    
    console.log('FCM token:', token);
    return token;
    
  } catch (err) {
    console.error('Error getting notification permission:', err);
    return null;
  }
}

// ─── SAVE FCM TOKEN TO FIRESTORE ──────────────────────────────────────────────
// Saves user's FCM token so admin can send them notifications.
// userId → the user's ID
// token → the FCM token from requestNotificationPermission()
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export async function saveFCMToken(userId, token) {
  if (!token) return;
  
  try {
    await setDoc(doc(db, 'userTokens', userId), {
      fcmToken: token,
      updatedAt: new Date(),
    }, { merge: true });
    
    console.log('FCM token saved for user:', userId);
  } catch (err) {
    console.error('Error saving FCM token:', err);
  }
}

// ─── LISTEN FOR FOREGROUND NOTIFICATIONS ──────────────────────────────────────
// Handles notifications when the app is open.
// Shows a toast notification instead of system notification.
export function listenForForegroundNotifications() {
  onMessage(messaging, (payload) => {
    console.log('Foreground notification:', payload);
    
    const { title, body } = payload.notification || {};
    
    if (title && body) {
      toast.info(body, {
        description: title,
        duration: 5000,
      });
    }
  });
}

// ─── SEND NOTIFICATION (ADMIN) ────────────────────────────────────────────────
// Admin-only: Sends a push notification to a user.
// This requires calling a Firebase Cloud Function (not included yet).
// 
// For now, notifications are sent automatically when messages are created
// via a Cloud Function trigger (see setup instructions below).
