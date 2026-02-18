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
    { id: '1',  name: 'Elegant Evening Dress',   price: 120, category: 'shoes',   image: '/placeholder.svg', description: 'Perfect for evening occasions.',              rating: 4.6, inStock: true },
    { id: '2',  name: 'Classic Daily Outfit',     price: 75,  category: 'shoes',   image: '/placeholder.svg', description: 'Comfortable and stylish for everyday use.',   rating: 4.3, inStock: true },
    { id: '3',  name: 'Chain Strap Bag',          price: 90,  category: 'bags',    image: '/placeholder.svg', description: 'Featuring adjustable chain strap.',           rating: 4.5, inStock: true },
    { id: '4',  name: 'Italian Leather Shoes',    price: 150, category: 'shoes',   image: '/placeholder.svg', description: 'Crafted from Italian leather.',               rating: 4.8, inStock: true },
    { id: '5',  name: 'Minimalist Watch',         price: 110, category: 'watches', image: '/placeholder.svg', description: 'Clean design with premium finishing.',        rating: 4.4, inStock: true },
    { id: '6',  name: 'Sport Sneakers',           price: 95,  category: 'shoes',   image: '/placeholder.svg', description: 'Lightweight build and solid grip.',           rating: 4.2, inStock: true },
    { id: '7',  name: 'Handcrafted Bag',          price: 130, category: 'bags',    image: '/placeholder.svg', description: 'Hand-stitched detailing.',                    rating: 4.7, inStock: true },
    { id: '8',  name: 'All-Weather Boots',        price: 160, category: 'shoes',   image: '/placeholder.svg', description: 'Waterproof and durable construction.',        rating: 4.6, inStock: true },
    { id: '9',  name: 'Leather Wallet',           price: 40,  category: 'bags',    image: '/placeholder.svg', description: 'Compact storage with premium feel.',          rating: 4.1, inStock: true },
    { id: '10', name: 'Diver Watch Pro',          price: 220, category: 'watches', image: '/placeholder.svg', description: '300m water resistance with luminous dial.',   rating: 4.9, inStock: true },
    { id: '11', name: 'Smart Watch Lite',         price: 180, category: 'watches', image: '/placeholder.svg', description: 'Daily tracking with a clean interface.',      rating: 4.4, inStock: true },
    { id: '12', name: 'Smart Watch Titanium',     price: 320, category: 'watches', image: '/placeholder.svg', description: 'Heart rate monitor and titanium case.',       rating: 4.8, inStock: true },
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
    { id: 'all',     name: 'All',     icon: 'all'     },
    { id: 'bags',    name: 'Bags',    icon: 'bags'    },
    { id: 'shoes',   name: 'Shoes',   icon: 'shoes'   },
    { id: 'watches', name: 'Watches', icon: 'watches' },
  ];