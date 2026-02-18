/**
 * AdminPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin dashboard with 3 tabs:
 *   1. Overview  → stats + recent orders
 *   2. Products  → list all products + Add/Edit/Delete form
 *   3. Orders    → full order list with status updates
 *
 * CONNECTIONS:
 *   → src/store/useStore.js     (state.products, state.orders, dispatch)
 *   → src/lib/firestore.js      (addProduct, updateProduct, deleteProduct)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import {
  Package, DollarSign, Users, ShoppingBag, Truck,
  CheckCircle, Clock, Edit3, Trash2, Plus, X,
  ArrowUpRight, ArrowDownRight, Loader2, ImageIcon,
  Save, AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { addProduct, updateProduct, deleteProduct } from '@/lib/firestore';
import { toast } from 'sonner';
import AdminMessages from './AdminMessages';

// ─── EMPTY FORM STATE ─────────────────────────────────────────────────────────
// Default values for the add/edit product form.
// Every field the admin can fill in is listed here.
const EMPTY_FORM = {
  name:          '',      // product name
  price:         '',      // price as a string (converted to number on save)
  category:      'bags',  // default category
  description:   '',      // product description
  image:         '',      // primary image URL
  images:        '',      // extra image URLs — comma separated, split on save
  videoUrl:      '',      // product video URL (YouTube, direct link etc.)
  stockQuantity: '',      // how many in stock
  inStock:       true,    // whether the product is available
  rating:        '0',     // initial rating
};

// Available categories for the dropdown
const CATEGORY_OPTIONS = ['bags', 'shoes', 'watches', 'clothing', 'accessories', 'other'];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const statusColors = {
  pending:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  paid:      'bg-green-500/20  text-green-300  border-green-500/30',
  shipped:   'bg-blue-500/20   text-blue-300   border-blue-500/30',
  delivered: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const statusIcons = {
  pending:   <Clock       className="w-3.5 h-3.5" />,
  paid:      <CheckCircle className="w-3.5 h-3.5" />,
  shipped:   <Truck       className="w-3.5 h-3.5" />,
  delivered: <Package     className="w-3.5 h-3.5" />,
};


// ─── COMPONENT ───────────────────────────────────────────────────────────────
const AdminPanel = () => {

  // ── GLOBAL STATE ────────────────────────────────────────────────────────
  // state.products → all products from Firestore
  // state.orders   → all orders
  // dispatch       → triggers state changes (ADD_PRODUCT, UPDATE_PRODUCT etc.)
  const { state, dispatch } = useStore();

  // ── LOCAL STATE ─────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('overview'); // 'overview' | 'products' | 'orders' | 'messages'
  
  // ── LISTEN FOR TAB SWITCH FROM HEADER ───────────────────────────────────
  // When admin clicks the message icon in the header, auto-switch to messages tab
  useEffect(() => {
    // Check localStorage for tab preference on mount
    const savedTab = localStorage.getItem('admin_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
      localStorage.removeItem('admin_active_tab'); // clear after reading
    }
    
    // Listen for custom event from Header
    const handleTabSwitch = (event) => {
      setActiveTab(event.detail);
    };
    
    window.addEventListener('switchAdminTab', handleTabSwitch);
    
    return () => {
      window.removeEventListener('switchAdminTab', handleTabSwitch);
    };
  }, []);
  const [showForm,     setShowForm]     = useState(false);      // show/hide the product form
  const [editingProduct, setEditingProduct] = useState(null);   // null = adding new, object = editing
  const [formData,     setFormData]     = useState(EMPTY_FORM); // current form field values
  const [isSaving,     setIsSaving]     = useState(false);      // true while saving to Firestore
  const [formError,    setFormError]    = useState('');         // validation error message
  const [deleteConfirm, setDeleteConfirm] = useState(null);     // product ID pending delete confirmation


  // ── STATS ────────────────────────────────────────────────────────────────
  // Computed from global state — updates automatically when orders change
  const totalRevenue = state.orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders  = state.orders.length;

  const stats = [
    {
      label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`,
      change: '+12.5%', up: true,
      icon: <DollarSign className="w-5 h-5" />, gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Total Orders', value: totalOrders.toString(),
      change: '+8.2%', up: true,
      icon: <ShoppingBag className="w-5 h-5" />, gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Products', value: state.products.length.toString(),
      change: `${state.products.length} total`, up: true,
      icon: <Package className="w-5 h-5" />, gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Customers', value: '2,847',
      change: '+15.3%', up: true,
      icon: <Users className="w-5 h-5" />, gradient: 'from-orange-500 to-red-500',
    },
  ];


  // ── FORM HELPERS ─────────────────────────────────────────────────────────

  // openAddForm → resets the form and opens it in "add new product" mode
  const openAddForm = () => {
    setEditingProduct(null);     // no product being edited — this is a new one
    setFormData(EMPTY_FORM);     // clear all fields
    setFormError('');            // clear any previous error
    setShowForm(true);           // show the form
  };

  // openEditForm → fills the form with an existing product's data
  // product → the product object to edit
  const openEditForm = (product) => {
    setEditingProduct(product);  // remember which product we're editing
    setFormData({
      name:          product.name          || '',
      price:         product.price?.toString() || '',
      category:      product.category      || 'bags',
      description:   product.description   || '',
      image:         product.image         || '',
      // images array → join back to comma-separated string for the input field
      images:        Array.isArray(product.images) ? product.images.join(', ') : '',
      videoUrl:      product.videoUrl      || '',
      stockQuantity: product.stockQuantity?.toString() || '',
      inStock:       product.inStock !== false, // default to true
      rating:        product.rating?.toString() || '0',
    });
    setFormError('');
    setShowForm(true);
  };

  // closeForm → hides the form and resets everything
  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  // handleChange → updates a single form field when the user types
  // e → the input change event
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // For checkboxes use `checked`, for everything else use `value`
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // validateForm → checks required fields before saving
  // Returns true if valid, false if not
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setFormError('A valid price is required');
      return false;
    }
    if (!formData.category) {
      setFormError('Category is required');
      return false;
    }
    return true;
  };

  // handleSave → saves the product to Firestore (add or update)
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setFormError('');

    // Build the product object from form data
    // Convert string inputs to the right types
    const productData = {
      name:          formData.name.trim(),
      price:         parseFloat(formData.price),      // "110" → 110
      category:      formData.category,
      description:   formData.description.trim(),
      image:         formData.image.trim() || '/placeholder.svg', // fallback image
      // Split comma-separated URLs into an array, filter out empty strings
      images:        formData.images
                       .split(',')
                       .map((url) => url.trim())
                       .filter(Boolean),
      videoUrl:      formData.videoUrl.trim(),
      stockQuantity: parseInt(formData.stockQuantity) || 0, // "10" → 10
      inStock:       formData.inStock,
      rating:        parseFloat(formData.rating) || 0,
    };

    try {
      if (editingProduct) {
        // ── EDIT EXISTING PRODUCT ──
        // updateProduct saves changes to Firestore
        // CONNECTS TO → src/lib/firestore.js → updateProduct()
        const updated = await updateProduct(editingProduct.id, productData);

        // Update local state immediately so UI reflects the change
        // without waiting for a Firestore re-fetch
        dispatch({ type: 'UPDATE_PRODUCT', product: { id: editingProduct.id, ...productData } });
        toast.success(`"${productData.name}" updated successfully!`);

      } else {
        // ── ADD NEW PRODUCT ──
        // addProduct saves to Firestore and returns the new product with its ID
        // CONNECTS TO → src/lib/firestore.js → addProduct()
        const newProduct = await addProduct(productData);

        // Add to local state immediately
        dispatch({ type: 'ADD_PRODUCT', product: newProduct });
        toast.success(`"${productData.name}" added successfully!`);
      }

      closeForm(); // hide form on success

    } catch (err) {
      console.error('Save product error:', err);
      setFormError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // handleDelete → deletes a product from Firestore after confirmation
  // productId → the ID of the product to delete
  const handleDelete = async (productId) => {
    try {
      // deleteProduct removes from Firestore
      // CONNECTS TO → src/lib/firestore.js → deleteProduct()
      await deleteProduct(productId);

      // Remove from local state immediately
      dispatch({ type: 'DELETE_PRODUCT', productId });
      toast.success('Product deleted');
      setDeleteConfirm(null); // hide confirmation dialog

    } catch (err) {
      console.error('Delete product error:', err);
      toast.error('Failed to delete product');
    }
  };


  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── ADMIN HEADER ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-white/50">Manage your store, products, and orders</p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {['overview', 'products', 'orders', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>


        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="relative overflow-hidden p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                      <div className="text-white">{stat.icon}</div>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs font-medium ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Order ID', 'Customer', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-white">{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{order.customerName}</div>
                          <div className="text-xs text-white/40">{order.customerEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-pink-400">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                            {statusIcons[order.status]}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">{order.date}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: order.id, status: e.target.value });
                              toast.success(`Order ${order.id} updated to ${e.target.value}`);
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-pink-500/50"
                          >
                            {['pending', 'paid', 'shipped', 'delivered'].map((s) => (
                              <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PRODUCTS TAB                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-6">

            {/* Products header + Add button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                All Products ({state.products.length})
              </h3>
              <button
                onClick={openAddForm}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-white text-sm font-medium hover:from-pink-600 hover:to-red-600 transition-all shadow-lg shadow-pink-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* ── ADD / EDIT PRODUCT FORM ── */}
            {/* Only visible when showForm is true */}
            {showForm && (
              <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6">

                {/* Form header */}
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-white">
                    {/* Show different title depending on add vs edit */}
                    {editingProduct ? `Editing: ${editingProduct.name}` : 'Add New Product'}
                  </h4>
                  {/* Close button — hides form without saving */}
                  <button onClick={closeForm} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Error message */}
                {formError && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Form fields — 2 column grid on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Italian Leather Bag"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Price (USD) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 120"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500/50"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-900 capitalize">{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the product..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50 resize-none"
                    />
                  </div>

                  {/* Primary Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                      Primary Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                    {/* Live image preview */}
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-2 w-24 h-24 object-cover rounded-lg border border-white/10"
                        onError={(e) => { e.target.style.display = 'none'; }} // hide if URL is broken
                      />
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Additional Image URLs
                      <span className="text-white/30 ml-1">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
                      placeholder="https://img1.com/a.jpg, https://img2.com/b.jpg"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  {/* Video URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-white/50 mb-1.5">
                      Product Video URL
                      <span className="text-white/30 ml-1">(YouTube or direct link)</span>
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Stock Quantity</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  {/* In Stock toggle */}
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      name="inStock"
                      id="inStock"
                      checked={formData.inStock}
                      onChange={handleChange}
                      className="w-4 h-4 rounded accent-pink-500"
                    />
                    <label htmlFor="inStock" className="text-sm text-white/70 cursor-pointer">
                      In Stock
                    </label>
                  </div>
                </div>

                {/* Form action buttons */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">

                  {/* Save button — calls handleSave() */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-white font-medium hover:from-pink-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                    ) : (
                      <><Save className="w-4 h-4" /><span>{editingProduct ? 'Save Changes' : 'Add Product'}</span></>
                    )}
                  </button>

                  {/* Cancel button — closes form without saving */}
                  <button
                    onClick={closeForm}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── PRODUCTS LIST ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.products.map((product) => (
                <div key={product.id} className="flex gap-4 p-4 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 transition-all">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{product.name}</h4>
                    <p className="text-xs text-white/40 capitalize">{product.category}</p>
                    <p className="text-sm font-medium text-pink-400 mt-1">${product.price?.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.stockQuantity !== undefined && (
                        <span className="text-xs text-white/30">Qty: {product.stockQuantity}</span>
                      )}
                    </div>
                  </div>

                  {/* Edit + Delete buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => openEditForm(product)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── DELETE CONFIRMATION DIALOG ── */}
            {/* Shows when admin clicks delete — prevents accidental deletes */}
            {deleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full mx-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Delete Product?</h4>
                  <p className="text-white/50 text-sm mb-6">
                    This will permanently remove the product from your store and cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition-all"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ORDERS TAB                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">All Orders ({state.orders.length})</h3>

            {state.orders.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-2xl">
                <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white/40">No orders yet</h3>
                <p className="text-sm text-white/30 mt-1">Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.orders.map((order) => (
                  <div key={order.id} className="p-6 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{order.id}</h4>
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                            {statusIcons[order.status]}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-white/50">{order.customerName} · {order.customerEmail}</p>
                        <p className="text-xs text-white/30 mt-1">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                          ${order.total.toFixed(2)}
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            dispatch({ type: 'UPDATE_ORDER_STATUS', orderId: order.id, status: e.target.value });
                            toast.success(`Order ${order.id} updated to ${e.target.value}`);
                          }}
                          className="mt-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-pink-500/50"
                        >
                          {['pending', 'paid', 'shipped', 'delivered'].map((s) => (
                            <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* MESSAGES TAB                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'messages' && <AdminMessages />}

      </div>
    </section>
  );
};

export default AdminPanel;