// src/lib/messaging.js
// ─────────────────────────────────────────────────────────────────────────────
// Firestore messaging service - handles all chat operations between clients and admin.
//
// DATA STRUCTURE:
// conversations/{conversationId}
//   - participants: [userId, 'admin']
//   - lastMessage: { text, timestamp, sender }
//   - unreadCount: { admin: 0, userId: 2 }
//   - createdAt, updatedAt
//
// conversations/{conversationId}/messages/{messageId}
//   - text, imageUrl, productId
//   - senderId, senderName
//   - timestamp, read
//   - type: 'text' | 'image' | 'product' | 'order_update'
//
// CONNECTIONS:
//   → src/firebase/firebase.js  (Firestore instance)
//   → src/components/ChatBubble.jsx
//   → src/components/AdminMessages.jsx
// ─────────────────────────────────────────────────────────────────────────────

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    getDocs,
    getDoc,
  } from 'firebase/firestore';
  import { db } from '@/firebase/firebase';
  
  const CONVERSATIONS_COLLECTION = 'conversations';
  const MESSAGES_SUBCOLLECTION = 'messages';
  
  // ─── GET OR CREATE CONVERSATION ───────────────────────────────────────────────
  // Finds an existing conversation between user and admin, or creates a new one.
  // userId → the client's user ID
  // userName → the client's display name
  // Returns the conversation ID
  export async function getOrCreateConversation(userId, userName) {
    try {
      // Check if conversation already exists
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Conversation exists — return its ID
        return snapshot.docs[0].id;
      }
      
      // No conversation exists — create new one
      const conversationRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
        participants: [userId, 'admin'], // user ID + 'admin'
        participantNames: {
          [userId]: userName,
          admin: 'Support Team',
        },
        lastMessage: null,
        unreadCount: {
          admin: 0,
          [userId]: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return conversationRef.id;
      
    } catch (err) {
      console.error('Get/create conversation error:', err);
      throw new Error('Failed to start conversation');
    }
  }
  
  // ─── SEND MESSAGE ──────────────────────────────────────────────────────────────
  // Sends a message in a conversation.
  // conversationId → which conversation
  // message → { text?, imageUrl?, productId?, type, senderId, senderName }
  export async function sendMessage(conversationId, message) {
    try {
      const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);
      
      // Add message to messages subcollection
      await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
        read: false, // mark as unread initially
      });
      
      // Update conversation's lastMessage and unreadCount
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationSnap = await getDoc(conversationRef);
      const conversationData = conversationSnap.data();
      
      // Determine who should get the unread count incremented
      // If admin sent it, increment user's unread; if user sent it, increment admin's
      const recipientId = message.senderId === 'admin' 
        ? conversationData.participants.find(p => p !== 'admin')
        : 'admin';
      
      await updateDoc(conversationRef, {
        lastMessage: {
          text: message.text || (message.type === 'image' ? '📷 Image' : '🔗 Product'),
          timestamp: new Date(),
          senderId: message.senderId,
        },
        [`unreadCount.${recipientId}`]: (conversationData.unreadCount?.[recipientId] || 0) + 1,
        updatedAt: serverTimestamp(),
      });
      
    } catch (err) {
      console.error('Send message error:', err);
      throw new Error('Failed to send message');
    }
  }
  
  // ─── LISTEN TO MESSAGES ────────────────────────────────────────────────────────
  // Sets up a real-time listener for messages in a conversation.
  // conversationId → which conversation to listen to
  // callback → function called with array of messages whenever they update
  // Returns unsubscribe function to stop listening
  export function listenToMessages(conversationId, callback) {
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    // onSnapshot sets up real-time listener — callback fires on every change
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      callback(messages);
    });
  }
  
  // ─── LISTEN TO CONVERSATIONS (ADMIN) ───────────────────────────────────────────
  // Admin-only: listens to all conversations for the admin inbox.
  // callback → function called with array of conversations
  // Returns unsubscribe function
  export function listenToAllConversations(callback) {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', 'admin'),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
      callback(conversations);
    });
  }
  
  // ─── MARK MESSAGES AS READ ─────────────────────────────────────────────────────
  // Marks all messages in a conversation as read for a specific user.
  // conversationId → which conversation
  // userId → who is marking as read ('admin' or user ID)
  export async function markMessagesAsRead(conversationId, userId) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      
      // Reset unread count for this user
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
      });
      
      // Mark all messages in the conversation as read
      // (This is a simplified approach — in production you'd only mark messages
      // sent by the OTHER person as read, not your own messages)
      const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);
      const snapshot = await getDocs(messagesRef);
      
      const updatePromises = snapshot.docs.map((messageDoc) => 
        updateDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION, messageDoc.id), {
          read: true,
        })
      );
      
      await Promise.all(updatePromises);
      
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }
  
  // ─── UPDATE TYPING STATUS ──────────────────────────────────────────────────────
  // Updates whether a user is currently typing.
  // conversationId → which conversation
  // userId → who is typing
  // isTyping → true if typing, false if stopped
  export async function updateTypingStatus(conversationId, userId, isTyping) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      
      await updateDoc(conversationRef, {
        [`typing.${userId}`]: isTyping ? new Date() : null,
      });
      
    } catch (err) {
      console.error('Update typing status error:', err);
    }
  }
  
  // ─── DELETE MESSAGE ────────────────────────────────────────────────────────────
  // Deletes a message from a conversation.
  // conversationId → which conversation
  // messageId → which message to delete
  export async function deleteMessage(conversationId, messageId) {
    try {
      const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION, messageId);
      await updateDoc(messageRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Delete message error:', err);
      throw new Error('Failed to delete message');
    }
  }
  
  // ─── EDIT MESSAGE ──────────────────────────────────────────────────────────────
  // Edits an existing message's text.
  // conversationId → which conversation
  // messageId → which message to edit
  // newText → the updated message text
  export async function editMessage(conversationId, messageId, newText) {
    try {
      const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION, messageId);
      await updateDoc(messageRef, {
        text: newText,
        edited: true,
        editedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Edit message error:', err);
      throw new Error('Failed to edit message');
    }
  }
  
  // ─── FORWARD MESSAGE ───────────────────────────────────────────────────────────
  // Creates a copy of a message in another conversation.
  // sourceConversationId → where the message is now
  // targetConversationId → where to copy it
  // messageId → which message to forward
  // senderId → who is forwarding it
  // senderName → name of person forwarding
  export async function forwardMessage(sourceConversationId, targetConversationId, messageId, senderId, senderName) {
    try {
      // Get the original message
      const messageRef = doc(db, CONVERSATIONS_COLLECTION, sourceConversationId, MESSAGES_SUBCOLLECTION, messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        throw new Error('Message not found');
      }
      
      const originalMessage = messageSnap.data();
      
      // Create a copy in the target conversation
      await sendMessage(targetConversationId, {
        ...originalMessage,
        senderId,
        senderName,
        forwarded: true,
        originalSender: originalMessage.senderName,
      });
      
    } catch (err) {
      console.error('Forward message error:', err);
      throw new Error('Failed to forward message');
    }
  }