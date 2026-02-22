// src/lib/firestore.js
// ─────────────────────────────────────────────────────────────────────────────
// All Firestore database operations for products live here.
// This completely replaces supabase.js.
//
// CONNECTIONS:
//   → src/firebase/firebase.js   (Firestore instance)
//   → src/store/useStore.js      (calls these functions to load/save products)
//   → src/components/ecommerce/AdminPanel.jsx (add/edit/delete products)
// ─────────────────────────────────────────────────────────────────────────────

import {
    collection,    // reference to a Firestore collection (like a table)
    doc,           // reference to a specific document (like a row)
    getDocs,       // fetch all documents from a collection
    addDoc,        // add a new document with auto-generated ID
    updateDoc,     // update fields in an existing document
    deleteDoc,     // delete a document
    setDoc,        // set a document with a specific ID (used for seeding)
    serverTimestamp, // Firebase server time — more reliable than Date.now()
  } from 'firebase/firestore';
  
  import { db } from '@/firebase/firebase';
  
  // The name of our Firestore collection — like a table called "products"
  const PRODUCTS_COLLECTION = 'products';
  
  // ─── SEED DATA ───────────────────────────────────────────────────────────────
  // Your original products from products.js — used to pre-populate Firestore
  // on first run so the store doesn't start empty.
  const SEED_PRODUCTS = [
    { id: '1',  name: 'Midnight Aura',          price: 185, category: 'signature', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop', description: 'Deep oud and mysterious spices for the bold.', rating: 4.9, inStock: true },
    { id: '2',  name: 'Noir Essence',           price: 210, category: 'signature', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop', description: 'Velvet rose mixed with dark chocolate and amber.', rating: 4.8, inStock: true },
    { id: '3',  name: 'Golden Santal',          price: 165, category: 'signature', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop', description: 'Smooth sandalwood with a touch of gold foil luxury.', rating: 4.7, inStock: true },
    { id: '4',  name: 'Velvet Oud',             price: 245, category: 'oud',       image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop', description: 'The purest agarwood from the heart of the Orient.', rating: 4.9, inStock: true },
    { id: '5',  name: 'Royal Amber',            price: 195, category: 'oud',       image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop', description: 'Majestic amber notes with a hint of smoky vanilla.', rating: 4.8, inStock: true },
    { id: '6',  name: 'Mystic Musk',            price: 175, category: 'oud',       image: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?w=800&auto=format&fit=crop', description: 'A hauntingly beautiful white musk for the modern aura.', rating: 4.6, inStock: true },
    { id: '7',  name: 'Blossom Noir',           price: 155, category: 'floral',    image: 'https://images.unsplash.com/photo-1585232356846-530231c784b3?w=800&auto=format&fit=crop', description: 'Night-blooming jasmine and dark patchouli fusion.', rating: 4.5, inStock: true },
    { id: '8',  name: 'Silk Peony',             price: 140, category: 'floral',    image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&auto=format&fit=crop', description: 'Delicate peonies wrapped in a soft silk shroud.', rating: 4.4, inStock: true },
    { id: '9',  name: 'Midnight Garden',        price: 180, category: 'floral',    image: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?w=800&auto=format&fit=crop', description: 'A lush garden captured at the stroke of midnight.', rating: 4.7, inStock: true },
    { id: '10', name: 'Desert Rose',            price: 220, category: 'oud',       image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop', description: 'A resilient rose blooming amidst warm desert sands.', rating: 4.9, inStock: true },
    { id: '11', name: 'Citrus Gold',            price: 130, category: 'floral',    image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=800&auto=format&fit=crop', description: 'Bright bergamot and neroli for a golden glow.', rating: 4.3, inStock: true },
    { id: '12', name: 'Imperial Leather',       price: 275, category: 'signature', image: 'https://images.unsplash.com/photo-1557170334-a7c3c467b1f1?w=800&auto=format&fit=crop', description: 'The scent of a king. Rare leather and vintage iris.', rating: 5.0, inStock: true },
  ];
  
  // ─── FETCH ALL PRODUCTS ───────────────────────────────────────────────────────
  // Gets all products from Firestore.
  // If the collection is empty (first run), seeds it with SEED_PRODUCTS first.
  // Returns an array of product objects.
  // CALLED BY → src/store/useStore.js on app load
  export async function fetchProducts() {
    try {
      const colRef  = collection(db, PRODUCTS_COLLECTION); // reference to 'products' collection
      const snapshot = await getDocs(colRef);              // fetch all documents
  
      // If collection is empty, seed it with default products
      if (snapshot.empty) {
        console.log('Firestore: No products found — seeding with default products...');
        await seedProducts();
        // Fetch again after seeding
        const seededSnapshot = await getDocs(colRef);
        return seededSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
  
      // Map each Firestore document to a plain JS object
      // doc.id → the document ID (e.g. '1', '2', or an auto-generated ID)
      // doc.data() → all the fields (name, price, category, etc.)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
    } catch (err) {
      console.error('Firestore fetchProducts error:', err);
      // Fall back to seed data if Firestore fails (e.g. offline)
      return SEED_PRODUCTS;
    }
  }
  
  // ─── SEED PRODUCTS ────────────────────────────────────────────────────────────
  // Writes the default products to Firestore with specific IDs.
  // Only runs automatically if the collection is empty (first app load).
  // Uses setDoc with specific IDs so products always have predictable IDs.
  async function seedProducts() {
    const promises = SEED_PRODUCTS.map((product) => {
      const { id, ...data } = product;
      // setDoc with a specific ID — like INSERT with a known primary key
      return setDoc(doc(db, PRODUCTS_COLLECTION, id), {
        ...data,
        createdAt: serverTimestamp(), // when the product was added
      });
    });
    await Promise.all(promises); // run all writes in parallel
    console.log('Firestore: Seeded', SEED_PRODUCTS.length, 'products');
  }
  
  // ─── ADD PRODUCT ──────────────────────────────────────────────────────────────
  // Adds a new product to Firestore.
  // Firestore auto-generates a unique ID for new products.
  // Returns the new product object including the generated ID.
  // CALLED BY → AdminPanel.jsx when admin submits the add product form
  export async function addProduct(productData) {
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
  
      // addDoc automatically generates a unique document ID
      const docRef = await addDoc(colRef, {
        ...productData,
        rating:    productData.rating || 0,   // default rating for new products
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
  
      // Return the new product with its generated Firestore ID
      return { id: docRef.id, ...productData };
  
    } catch (err) {
      console.error('Firestore addProduct error:', err);
      throw new Error('Failed to add product. Please try again.');
    }
  }
  
  // ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────
  // Updates an existing product's fields in Firestore.
  // Only updates the fields provided — leaves others unchanged.
  // CALLED BY → AdminPanel.jsx when admin submits the edit product form
  export async function updateProduct(productId, updates) {
    try {
      // doc(db, collection, id) → reference to a specific document
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(), // track when it was last changed
      });
  
      return { id: productId, ...updates };
  
    } catch (err) {
      console.error('Firestore updateProduct error:', err);
      throw new Error('Failed to update product. Please try again.');
    }
  }
  
  // ─── DELETE PRODUCT ───────────────────────────────────────────────────────────
  // Permanently deletes a product from Firestore.
  // CALLED BY → AdminPanel.jsx when admin clicks the delete button
  export async function deleteProduct(productId) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(docRef);
      return productId; // return ID so the store can remove it from state
    } catch (err) {
      console.error('Firestore deleteProduct error:', err);
      throw new Error('Failed to delete product. Please try again.');
    }
  }
  
  // ─── CATEGORIES (static — not stored in Firestore) ───────────────────────────
  // Categories are fixed for now. When the admin adds a product with a new
  // category name it will appear in filters automatically via the products data.
  export const categories = [
    { id: 'all',       name: 'All',           icon: 'all'       },
    { id: 'signature', name: 'Signature',     icon: 'signature' },
    { id: 'oud',       name: 'Oud & Oriental', icon: 'oud'       },
    { id: 'floral',    name: 'Floral & Fresh', icon: 'floral'    },
  ];