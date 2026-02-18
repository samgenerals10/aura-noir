// public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase Cloud Messaging Service Worker
// This runs in the background and handles notifications when the app is closed.
// 
// IMPORTANT: This file MUST be in the public/ folder at the root level.
// ─────────────────────────────────────────────────────────────────────────────

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Your Firebase config - REPLACE with your actual config from firebase.js
firebase.initializeApp({
  apiKey: "AIzaSyDi8JZqH8vY0KVxQxEOQKWDl6T7LBgVXXc",
  authDomain: "aura-noir-5fd5a.firebaseapp.com",
  projectId: "aura-noir-5fd5a",
  storageBucket: "aura-noir-5fd5a.firebasestorage.app",
  messagingSenderId: "524808009085",
  appId: "1:524808009085:web:5ea6d84f67e13c6f81d1fc"
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed)
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/logo.png', // Add your logo in public folder
    badge: '/badge.png', // Optional badge icon
    tag: 'message-notification',
    requireInteraction: false,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});
