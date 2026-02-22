// src/lib/staff_invites.js
// ─────────────────────────────────────────────────────────────────────────────
// Firestore operations for staff invitations.
// ─────────────────────────────────────────────────────────────────────────────

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';

const INVITES_COLLECTION = 'staff_invites';

/**
 * Creates a new invitation token.
 * Only callable by an existing admin.
 */
export async function createInvite(createdBy, createdByEmail, location) {
  try {
    const colRef = collection(db, INVITES_COLLECTION);
    const docRef = await addDoc(colRef, {
      token:             Math.random().toString(36).substring(2, 15),
      status:            'active', // 'active' | 'used'
      createdBy:         createdBy,
      generatedByEmail:  createdByEmail,
      generatedLocation: location,
      createdAt:         serverTimestamp(),
      usedBy:            null,
      usedByEmail:       null,
      usedLocation:      null,
      usedAt:            null
    });
    
    // Fetch the document to get the token back
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() };
  } catch (err) {
    console.error('Error creating invite:', err);
    throw err;
  }
}

/**
 * Lists all invitations.
 */
export async function fetchInvites() {
  try {
    const colRef = collection(db, INVITES_COLLECTION);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching invites:', err);
    return [];
  }
}

/**
 * Validates an invitation token.
 * Returns the invite object if valid, otherwise throws error.
 */
export async function validateInviteToken(token) {
  try {
    const colRef = collection(db, INVITES_COLLECTION);
    const q = query(colRef, where('token', '==', token), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Invalid or expired invitation token.');
    }
    
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (err) {
    console.error('Error validating token:', err);
    throw err;
  }
}

/**
 * Marks an invitation as used.
 */
export async function markInviteUsed(inviteId, usedByUserId, usedByEmail, location) {
  try {
    const docRef = doc(db, INVITES_COLLECTION, inviteId);
    await updateDoc(docRef, {
      status: 'used',
      usedBy: usedByUserId,
      usedByEmail: usedByEmail,
      usedLocation: location,
      usedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error marking invite as used:', err);
  }
}
