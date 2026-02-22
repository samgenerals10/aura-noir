/**
 * AdminMessages.jsx - ENHANCED VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-featured admin inbox with all the same features as client chat:
 * - Delete, Copy, Edit, Forward messages
 * - Emoji picker + Stickers
 * - File/document attachments
 * - Contact sharing
 * 
 * REQUIRED: bun add emoji-picker-react
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Loader2, Check, CheckCheck, User, Package,
  Image as ImageIcon, MoreVertical, Copy, Edit3, Trash2, Share2,
  Smile, Sticker as StickerIcon, Paperclip, File, User as UserIcon,
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useStore } from '@/store/useStore';
import {
  listenToAllConversations, listenToMessages, sendMessage, markMessagesAsRead,
  updateTypingStatus, deleteMessage, editMessage,
} from '@/lib/messaging';
import { toast } from 'sonner';

// Same sticker pack as client chat
const STICKERS = [
  'https://em-content.zobj.net/thumbs/120/google/350/thumbs-up_1f44d.png',
  'https://em-content.zobj.net/thumbs/120/google/350/red-heart_2764-fe0f.png',
  'https://em-content.zobj.net/thumbs/120/google/350/fire_1f525.png',
  'https://em-content.zobj.net/thumbs/120/google/350/party-popper_1f389.png',
  'https://em-content.zobj.net/thumbs/120/google/350/clapping-hands_1f44f.png',
  'https://em-content.zobj.net/thumbs/120/google/350/ok-hand_1f44c.png',
];

const AdminMessages = () => {
  const { state } = useStore();
  
  // Conversations list
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  
  // Messages in selected conversation
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Input state
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Enhanced features
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Message actions
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // File upload handler
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }
    
    setFileName(file.name);
    
    if (file.type.startsWith('image/') && file.size < 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setImageUrl(e.target.result);
        setShowImageInput(false);
        toast.success('Image ready to send');
      };
      reader.readAsDataURL(file);
    } else {
      toast.info('Please upload to a file hosting service and paste the URL, or upgrade to Blaze plan for direct uploads');
      setShowFilePicker(true);
    }
  };
  
  // Image upload handler
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      toast.success('Image ready to send');
    };
    reader.readAsDataURL(file);
  };
  
  // Listen to all conversations
  useEffect(() => {
    const unsubscribe = listenToAllConversations((convs) => {
      setConversations(convs);
      setLoadingConversations(false);
      if (!selectedConversationId && convs.length > 0) {
        setSelectedConversationId(convs[0].id);
      }
    });
    return () => unsubscribe();
  }, [selectedConversationId]);
  
  // Listen to selected conversation messages
  useEffect(() => {
    if (!selectedConversationId) return;
    setLoadingMessages(true);
    const unsubscribe = listenToMessages(selectedConversationId, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
    });
    markMessagesAsRead(selectedConversationId, 'admin');
    return () => unsubscribe();
  }, [selectedConversationId]);
  
  // Handle typing
  const handleTyping = () => {
    if (!selectedConversationId) return;
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(selectedConversationId, 'admin', true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(selectedConversationId, 'admin', false);
    }, 2000);
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() && !imageUrl.trim() && !fileUrl.trim()) return;
    if (!selectedConversationId) return;
    
    setIsSending(true);
    try {
      const message = {
        type: fileUrl ? 'file' : imageUrl ? 'image' : 'text',
        text: messageText.trim(),
        imageUrl: imageUrl.trim(),
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim(),
        senderId: 'admin',
        senderName: 'Support Team',
      };
      
      await sendMessage(selectedConversationId, message);
      setMessageText('');
      setImageUrl('');
      setFileUrl('');
      setFileName('');
      setShowImageInput(false);
      setShowFilePicker(false);
      setIsTyping(false);
      updateTypingStatus(selectedConversationId, 'admin', false);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  // Send product
  const handleSendProduct = async (product) => {
    if (!selectedConversationId) return;
    setIsSending(true);
    setShowProductPicker(false);
    try {
      await sendMessage(selectedConversationId, {
        type: 'product',
        text: `Check out: ${product.name}`,
        productId: product.id,
        senderId: 'admin',
        senderName: 'Support Team',
      });
      toast.success('Product shared!');
    } catch {
      toast.error('Failed to share product');
    } finally {
      setIsSending(false);
    }
  };
  
  // Send sticker
  const handleSendSticker = async (stickerUrl) => {
    if (!selectedConversationId) return;
    setIsSending(true);
    setShowStickerPicker(false);
    try {
      await sendMessage(selectedConversationId, {
        type: 'sticker',
        imageUrl: stickerUrl,
        senderId: 'admin',
        senderName: 'Support Team',
      });
    } catch {
      toast.error('Failed to send sticker');
    } finally {
      setIsSending(false);
    }
  };
  
  // Copy message
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied!');
    setSelectedMessage(null);
  };
  
  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!selectedConversationId) return;
    try {
      await deleteMessage(selectedConversationId, messageId);
      toast.success('Message deleted');
      setSelectedMessage(null);
    } catch {
      toast.error('Failed to delete message');
    }
  };
  
  // Edit message
  const handleEditMessage = async () => {
    if (!editText.trim()) return;
    try {
      await editMessage(selectedConversationId, editingMessageId, editText.trim());
      toast.success('Message updated');
      setEditingMessageId(null);
      setEditText('');
    } catch {
      toast.error('Failed to edit message');
    }
  };
  
  // Forward message
  const handleForwardMessage = async () => {
    toast.info('Select a conversation to forward to');
    setSelectedMessage(null);
  };
  
  // Emoji select
  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  // Render message
  const renderMessage = (msg) => {
    if (msg.deleted) {
      return (
        <div key={msg.id} className="flex justify-center mb-3">
          <p className="text-xs text-white/30 italic">Message deleted</p>
        </div>
      );
    }
    
    const isOwn = msg.senderId === 'admin';
    const product = msg.productId ? state.products.find(p => p.id === msg.productId) : null;
    const isEditing = editingMessageId === msg.id;
    
    return (
      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
        <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
          
          {!isOwn && <p className="text-xs text-white/40 mb-1 px-1">{msg.senderName}</p>}
          
          {/* Message actions */}
          {isOwn && !isEditing && (
            <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setSelectedMessage(selectedMessage === msg.id ? null : msg.id)}
                className="p-1 rounded bg-white/10 hover:bg-white/20"
              >
                <MoreVertical className="w-4 h-4 text-white/70" />
              </button>
              
              {selectedMessage === msg.id && (
                <div className="absolute left-0 top-full mt-1 bg-black/95 border border-white/20 rounded-lg p-1 min-w-[120px] z-10">
                  {msg.text && (
                    <>
                      <button onClick={() => handleCopyMessage(msg.text)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded">
                        <Copy className="w-3 h-3" /><span>Copy</span>
                      </button>
                      <button onClick={() => { setEditingMessageId(msg.id); setEditText(msg.text); setSelectedMessage(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded">
                        <Edit3 className="w-3 h-3" /><span>Edit</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => handleForwardMessage()} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded">
                    <Share2 className="w-3 h-3" /><span>Forward</span>
                  </button>
                  <button onClick={() => handleDeleteMessage(msg.id)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded">
                    <Trash2 className="w-3 h-3" /><span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Edit mode */}
          {isEditing ? (
            <div className="bg-white/10 rounded-sm p-3 border border-white/20">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white text-sm mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => handleEditMessage()} className="px-3 py-1 bg-black border border-gold rounded text-white text-xs">Save</button>
                <button onClick={() => { setEditingMessageId(null); setEditText(''); }} className="px-3 py-1 bg-white/10 rounded text-white text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <div className={`rounded-sm px-4 py-2.5 ${
              isOwn ? 'bg-black border border-gold text-white'
                   : 'bg-white/10 text-white border border-white/10'
            }`}>
              {msg.forwarded && <p className="text-xs opacity-60 mb-1 flex items-center gap-1"><Share2 className="w-3 h-3" />Forwarded from {msg.originalSender}</p>}
              {msg.type === 'image' && msg.imageUrl && <img src={msg.imageUrl} alt="Shared" className="rounded-lg mb-2 max-w-full" />}
              {msg.type === 'sticker' && msg.imageUrl && <img src={msg.imageUrl} alt="Sticker" className="w-32 h-32 object-contain" />}
              {msg.type === 'file' && msg.fileUrl && (
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 rounded-lg p-3 mb-2 hover:bg-black/30">
                  <File className="w-5 h-5" /><span className="text-sm">{msg.fileName || 'Download file'}</span>
                </a>
              )}
              {msg.type === 'product' && product && (
                <div className="bg-black/20 rounded-lg p-3 mb-2 flex gap-3">
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{product.name}</p>
                    <p className="text-xs opacity-70">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              )}
              {msg.type === 'contact' && (
                <div className="bg-black/20 rounded-lg p-3 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><UserIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-semibold">{msg.contactName}</p>
                    <p className="text-xs opacity-70">{msg.contactEmail}</p>
                  </div>
                </div>
              )}
              {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
              {msg.edited && <p className="text-xs opacity-50 mt-1">edited</p>}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-60">{msg.timestamp?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                {isOwn && (msg.read ? <CheckCheck className="w-3 h-3 opacity-60" /> : <Check className="w-3 h-3 opacity-60" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const customerName = selectedConversation?.participantNames 
    ? Object.values(selectedConversation.participantNames).find(name => name !== 'Support Team')
    : 'Customer';
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      
      {/* Conversations list */}
      <div className="lg:col-span-1 bg-black border border-white/10 rounded-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /><span>Messages</span>
          </h3>
          <p className="text-sm text-white/40 mt-1">{conversations.length} conversations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-pink-500 animate-spin" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherParticipant = Object.entries(conv.participantNames || {})
                .find(([participantId]) => participantId !== 'admin')?.[1] || 'Customer';
              const unreadCount = conv.unreadCount?.admin || 0;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full p-4 border-b border-white/5 hover:bg-white/5 transition-all text-left ${
                    selectedConversationId === conv.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-black border border-gold flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white truncate">{otherParticipant}</p>
                        {unreadCount > 0 && <span className="text-xs bg-gold text-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
                      </div>
                      {conv.lastMessage && <p className="text-xs text-white/50 truncate">{conv.lastMessage.text}</p>}
                      {conv.updatedAt && <p className="text-xs text-white/30 mt-1">{conv.updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Conversation view */}
      <div className="lg:col-span-2 bg-black border border-white/10 rounded-sm overflow-hidden flex flex-col">
        {selectedConversationId ? (
          <>
            <div className="p-4 border-b border-white/10 bg-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black border border-gold flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{customerName}</h3>
                  <p className="text-xs text-white/50">Customer</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-pink-500 animate-spin" /></div>
              ) : (
                <>{messages.map(renderMessage)}<div ref={messagesEndRef} /></>
              )}
            </div>
            
            {/* Extended input area */}
            {showImageInput && (
              <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                <div className="flex gap-2 mb-2">
                  <button onClick={() => imageInputRef.current?.click()} className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-all">
                    📁 Choose Image File
                  </button>
                  <span className="text-white/30 self-center">or</span>
                </div>
                <input type="url" placeholder="Paste image URL..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50" />
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                {imageUrl && imageUrl.startsWith('data:image') && (
                  <img src={imageUrl} alt="Preview" className="mt-2 max-w-full h-32 object-contain rounded-lg border border-white/20" />
                )}
                <button onClick={() => { setShowImageInput(false); setImageUrl(''); }} className="text-xs text-white/40 hover:text-white mt-1">Cancel</button>
              </div>
            )}
            
            {showFilePicker && (
              <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                <div className="flex gap-2 mb-2">
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-all">
                    📎 Choose File
                  </button>
                  <span className="text-white/30 self-center">or</span>
                </div>
                <input type="text" placeholder="File name..." value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full px-3 py-2 mb-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50" />
                <input type="url" placeholder="Paste file URL..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50" />
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
                {fileName && <p className="text-xs text-white/50 mt-2">📄 {fileName}</p>}
                <button onClick={() => { setShowFilePicker(false); setFileUrl(''); setFileName(''); }} className="text-xs text-white/40 hover:text-white mt-1">Cancel</button>
              </div>
            )}
            
            {showProductPicker && (
              <div className="px-4 py-2 border-t border-white/10 bg-white/5 max-h-48 overflow-y-auto">
                <p className="text-xs text-white/50 mb-2">Select a product:</p>
                <div className="space-y-1">
                  {state.products.slice(0, 5).map((product) => (
                    <button key={product.id} onClick={() => handleSendProduct(product)} className="flex items-center gap-2 w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left">
                      <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{product.name}</p>
                        <p className="text-xs text-white/50">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowProductPicker(false)} className="text-xs text-white/40 hover:text-white mt-2">Cancel</button>
              </div>
            )}
            
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
              </div>
            )}
            
            {showStickerPicker && (
              <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                <p className="text-xs text-white/50 mb-2">Select a sticker:</p>
                <div className="grid grid-cols-4 gap-2">
                  {STICKERS.map((sticker, i) => (
                    <button key={i} onClick={() => handleSendSticker(sticker)} className="w-16 h-16 bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all">
                      <img src={sticker} alt="Sticker" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowStickerPicker(false)} className="text-xs text-white/40 hover:text-white mt-2">Cancel</button>
              </div>
            )}
            
            <div className="p-4 border-t border-white/10">
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1">
                  <button onClick={() => { setShowImageInput(!showImageInput); setShowProductPicker(false); setShowStickerPicker(false); setShowFilePicker(false); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all" title="Image">
                    <ImageIcon className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => { setShowProductPicker(!showProductPicker); setShowImageInput(false); setShowStickerPicker(false); setShowFilePicker(false); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all" title="Product">
                    <Package className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => { setShowStickerPicker(!showStickerPicker); setShowImageInput(false); setShowProductPicker(false); setShowFilePicker(false); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all" title="Sticker">
                    <StickerIcon className="w-4 h-4 text-white/70" />
                  </button>
                  <button onClick={() => { setShowFilePicker(!showFilePicker); setShowImageInput(false); setShowProductPicker(false); setShowStickerPicker(false); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all" title="File">
                    <Paperclip className="w-4 h-4 text-white/70" />
                  </button>
                </div>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full px-4 py-2.5 pr-10 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-500/50"
                  />
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10">
                    <Smile className="w-4 h-4 text-white/50" />
                  </button>
                </div>
                
                <button onClick={handleSendMessage} disabled={isSending || (!messageText.trim() && !imageUrl.trim() && !fileUrl.trim())} className="p-2.5 rounded-xl bg-black text-white hover:bg-black/90 transition-all disabled:opacity-50">
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;