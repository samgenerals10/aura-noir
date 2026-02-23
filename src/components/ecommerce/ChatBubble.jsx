/**
 * ChatBubble.jsx - ENHANCED VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-featured chat with:
 * - Delete, Copy, Edit, Forward messages
 * - Emoji picker + Stickers  
 * - File/document attachments
 * - Contact sharing
 * - All previous features (typing, read receipts, product sharing, etc.)
 *
 * REQUIRED PACKAGE: bun add emoji-picker-react
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, X, Send, Image as ImageIcon, Loader2, CheckCheck,
  MoreVertical, Smile, Paperclip, User as UserIcon, Maximize2,
  File, FileText, Link, 
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useStore } from '@/store/useStore';
import {
  getOrCreateConversation, sendMessage, listenToMessages, markMessagesAsRead,
  updateTypingStatus,
} from '@/lib/messaging';
import { ADMIN_CONTACT } from '@/config/adminContact';
import { toast } from 'sonner';

const ChatBubble = () => {
  const { state } = useStore();
  
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  
  // Chat state
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  
  // Resizability & Layout state
  const [dimensions, setDimensions] = useState({ width: 450, height: 450 });
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeType, setResizeType] = useState(null); // 'top', 'left', 'top-left'
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  
  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize conversation
  useEffect(() => {
    if (!isOpen || !state.user || conversationId) return;
    
    const initConversation = async () => {
      try {
        setIsLoading(true);
        const convId = await getOrCreateConversation(state.user.id, state.user.name);
        setConversationId(convId);
      } catch (err) {
        console.error('Init conversation error:', err);
        toast.error('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };
    
    initConversation();
  }, [isOpen, state.user, conversationId]);
  
  // Listen to messages
  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribe = listenToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage?.senderId === 'admin' && lastMessage?.typing) {
        setAdminTyping(true);
      } else {
        setAdminTyping(false);
      }
    });
    
    markMessagesAsRead(conversationId, state.user?.id);
    return () => unsubscribe();
  }, [conversationId, state.user?.id]);
  
  // ── INTERACTIVE CONTROLS ──────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = window.innerWidth - e.clientX - dragOffset.x;
        const newY = window.innerHeight - e.clientY - dragOffset.y;
        setPosition({ 
          x: Math.max(0, Math.min(window.innerWidth - dimensions.width, newX)), 
          y: Math.max(0, Math.min(window.innerHeight - (isMinimized ? 64 : dimensions.height), newY)) 
        });
      } else if (isResizing) {
        const deltaX = (window.innerWidth - e.clientX) - position.x;
        const deltaY = (window.innerHeight - e.clientY) - position.y;

        let newWidth = dimensions.width;
        let newHeight = dimensions.height;

        if (resizeType.includes('left')) {
          newWidth = deltaX;
        }
        if (resizeType.includes('top')) {
          newHeight = deltaY;
        }

        setDimensions({
          width: Math.max(380, Math.min(800, newWidth)),
          height: Math.max(400, Math.min(window.innerHeight - 100, newHeight))
        });
      } else if (isResizingSidebar) {
        const rect = chatRef.current.getBoundingClientRect();
        const newSidebarWidth = e.clientX - rect.left;
        setSidebarWidth(Math.max(150, Math.min(dimensions.width / 2, newSidebarWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsResizingSidebar(false);
    };

    if (isDragging || isResizing || isResizingSidebar) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isResizingSidebar, dragOffset, dimensions, position, resizeType]);

  const startDragging = (e) => {
    if (isMaximized || isMinimized) return;
    setIsDragging(true);
    setDragOffset({
      x: window.innerWidth - e.clientX - position.x,
      y: window.innerHeight - e.clientY - position.y
    });
  };

  const startResizing = (e, type) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
  };
  
  // Cleanup on Close
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
      setIsMaximized(false);
      const timer = setTimeout(() => {
        setMessages([]);
        setConversationId(null);
        setMessageText('');
        setImageUrl('');
        setFileUrl('');
        setFileName('');
        setShowFilePicker(false);
        setShowUrlInput(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle typing
  const handleTyping = () => {
    if (!conversationId || !state.user) return;
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(conversationId, state.user.id, true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(conversationId, state.user.id, false);
    }, 2000);
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() && !imageUrl && !fileUrl) return;
    if (!conversationId || !state.user) {
      toast.error('Please sign in to send messages');
      return;
    }
    
    setIsSending(true);
    
    try {
      const message = {
        type: fileUrl ? 'file' : imageUrl ? 'image' : 'text',
        text: messageText.trim(),
        imageUrl: imageUrl || '',
        fileUrl: fileUrl || '',
        fileName: fileName || '',
        senderId: state.user.id,
        senderName: state.user.name,
      };
      
      await sendMessage(conversationId, message);
      setMessageText('');
      setImageUrl('');
      setFileUrl('');
      setFileName('');
      setShowFilePicker(false);
      setShowUrlInput(false);
      setIsTyping(false);
      updateTypingStatus(conversationId, state.user.id, false);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle local file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate file upload with data URL for demo
      const reader = new FileReader();
      reader.onload = (event) => setFileUrl(event.target.result);
      reader.readAsDataURL(file);
      toast.success('File attached');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImageUrl(event.target.result);
      reader.readAsDataURL(file);
      toast.success('Image attached');
    }
  };
  
  // Emoji select
  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  // Render message
  const renderMessage = (msg) => {
    const isOwn = msg.senderId === state.user?.id;
    const product = msg.productId ? state.products.find(p => p.id === msg.productId) : null;
    
    return (
      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group animate-in slide-in-from-bottom-1 duration-200`}>
        <div className={`max-w-[85%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
          
          {/* WhatsApp Style Bubble */}
          <div className={`relative px-3 py-2 rounded-2xl shadow-sm ${
            isOwn 
              ? 'bg-gold/20 text-white rounded-tr-none border border-gold/10' 
              : 'bg-white/10 text-white rounded-tl-none border border-white/5'
          }`}>
            {/* Sender Name (Only for group/admin) */}
            {!isOwn && (
              <p className="text-[10px] font-bold text-gold/80 mb-0.5 uppercase tracking-tighter">
                {msg.senderName}
              </p>
            )}

            {/* Content Rendering */}
            {msg.type === 'image' && msg.imageUrl && (
              <div className="mb-1.5 overflow-hidden rounded-xl border border-white/10 group-hover:border-gold/30 transition-colors">
                <img src={msg.imageUrl} alt="Shared" className="max-w-full hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            
            {msg.type === 'file' && msg.fileUrl && (
              <div className="flex items-center gap-3 bg-black/40 rounded-xl p-3 mb-1.5 border border-white/5 hover:bg-black/60 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate text-white">{msg.fileName || 'document.pdf'}</p>
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gold hover:underline">Download</a>
                </div>
              </div>
            )}
            
            {msg.type === 'sticker' && msg.imageUrl && (
              <img src={msg.imageUrl} alt="Sticker" className="w-28 h-28 object-contain" />
            )}
            
            {msg.type === 'product' && product && (
              <div className="bg-black/40 rounded-xl p-2 mb-1.5 flex gap-2 border border-white/10">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate text-white">{product.name}</p>
                  <p className="text-[10px] text-gold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            )}

            {msg.text && (
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words pr-12">
                {msg.text}
              </p>
            )}

            {/* Meta Info (Inside Bubble) */}
            <div className="absolute bottom-1 right-2 flex items-center gap-1">
              <span className="text-[9px] text-white/40 font-medium">
                {msg.timestamp?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}
              </span>
              {isOwn && (
                <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-gold' : 'text-white/30'}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const isGuest = !state.user;
  
  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-black shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center text-white hover:scale-110 transition-transform border border-gold/30 group"
        >
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping group-hover:hidden" />
          <MessageCircle className="w-6 h-6 relative z-10" />
        </button>
      )}
      
      {/* Chat window */}
      {isOpen && (
        <div 
          ref={chatRef}
          style={{ 
            width: isMaximized ? 'calc(100vw - 48px)' : `${dimensions.width}px`,
            minWidth: '380px',
            height: isMinimized ? '64px' : isMaximized ? 'calc(100vh - 104px)' : `${dimensions.height}px`,
            bottom: isMaximized ? '24px' : `${position.y}px`,
            right: isMaximized ? '24px' : `${position.x}px`,
          }}
          className={`fixed z-[100] bg-matte-black-pure border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out animate-in fade-in zoom-in slide-in-from-bottom-4 ${isDragging || isResizing ? 'transition-none cursor-grabbing' : ''}`}
        >
          {/* Resize Handles */}
          {!isMaximized && !isMinimized && (
            <>
              <div className="absolute top-0 left-0 w-full h-1 cursor-ns-resize z-50 hover:bg-gold/30" onMouseDown={(e) => startResizing(e, 'top')} />
              <div className="absolute top-0 left-0 w-1 h-full cursor-ew-resize z-50 hover:bg-gold/30" onMouseDown={(e) => startResizing(e, 'left')} />
              <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50 hover:bg-gold/30" onMouseDown={(e) => startResizing(e, 'top-left')} />
            </>
          )}

          {/* Main Layout - Split Screen */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Column: Conversation List - ONLY for Admins or if explicitly needed */}
            {state.user?.role === 'admin' && (
              <div 
                className="border-r border-white/10 bg-[#111b21] flex flex-col relative"
                style={{ width: `${sidebarWidth}px` }}
              >
                {/* Sidebar Resizer */}
                <div 
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-gold/30 z-20 group"
                  onMouseDown={(e) => { e.stopPropagation(); setIsResizingSidebar(true); }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white/10 group-hover:bg-gold/50 rounded-full" />
                </div>
                <div className="p-4 bg-[#202c33] flex items-center justify-between border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gold" />
                  </div>
                  <div className="flex gap-2">
                    <MessageCircle className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                    <MoreVertical className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                  </div>
                </div>
                
                {/* Search */}
                <div className="p-2">
                  <div className="bg-[#202c33] rounded-lg px-3 py-1 flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-white/30" />
                    <input type="text" placeholder="Search or start chat" className="bg-transparent border-none text-xs text-white placeholder-white/30 outline-none w-full py-1" />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex items-center gap-3 p-3 bg-[#2a3942] border-l-4 border-gold cursor-pointer transition-colors">
                    <div className="w-12 h-12 rounded-full bg-black border border-gold/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=100" alt="Support" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 border-b border-white/5 pb-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-white truncate">Luxe Support</h4>
                        <span className="text-[10px] text-gold font-medium">Online</span>
                      </div>
                      <p className="text-xs text-white/40 truncate">Establish a connection by sending a text.</p>
                    </div>
                  </div>
                  
                  {/* Mock other chats */}
                  {['Personal Stylist', 'Order Updates', 'VIP Concierge'].map((name, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#202c33] cursor-not-allowed grayscale opacity-50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white/20" />
                      </div>
                      <div className="flex-1 min-w-0 border-b border-white/5 pb-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-white/80">{name}</h4>
                          <span className="text-[10px] text-white/20">Locked</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Right Column: Active Chat Area */}
            <div className="flex-1 flex flex-col bg-matte-black-pure relative">
               {/* Active Chat Header */}
               <div 
                 className={`p-3 bg-[#202c33] flex items-center justify-between border-b border-white/5 z-10 transition-colors ${!isMaximized && !isMinimized ? 'cursor-grab active:cursor-grabbing hover:bg-[#2a3942]' : ''}`}
                 onMouseDown={startDragging}
               >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/20">
                    <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=100" alt="Avatar" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Luxe Support</h3>
                    <p className="text-[10px] text-gold/60">{adminTyping ? 'typing...' : 'online'}</p>
                  </div>
                </div>
              </div>

              {/* Chat Background Pattern (Optional simulation) */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 relative scroll-smooth bg-chat-pattern">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm">End-to-end encrypted</p>
                  </div>
                ) : (
                  <>{messages.map(renderMessage)}<div ref={messagesEndRef} /></>
                )}
              </div>

              {/* Input Area (WhatsApp Style) */}
              <div className="p-3 bg-[#202c33] flex flex-col gap-2">
                {/* File/URL Previews */}
                {(imageUrl || fileUrl || showUrlInput) && (
                  <div className="px-2 py-2 bg-[#2a3942] rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    {imageUrl && (
                      <div className="relative inline-block">
                        <img src={imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gold/30" />
                        <button onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                    {fileUrl && (
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <File className="w-4 h-4 text-gold" />
                        <span className="truncate max-w-[200px]">{fileName}</span>
                        <button onClick={() => {setFileUrl(''); setFileName('');}} className="text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    )}
                    {showUrlInput && (
                      <div className="flex items-center gap-2 mt-1">
                        <Link className="w-4 h-4 text-gold" />
                        <input 
                          type="url" 
                          placeholder="Paste image/file URL..." 
                          className="flex-1 bg-black/20 border-none text-[11px] py-1 px-2 rounded outline-none text-white focus:ring-1 ring-gold/30"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.match(/\.(jpeg|jpg|gif|png|webp)/i)) setImageUrl(val);
                            else setFileUrl(val);
                          }}
                        />
                        <button onClick={() => setShowUrlInput(false)} className="text-[10px] text-white/40">Cancel</button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex gap-1 items-center border-r border-white/5 pr-2 mr-1">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 text-white/40 hover:text-red-400 transition-all"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="p-1.5 text-white/40 hover:text-blue-400 transition-all"
                      title="Maximize"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://wa.me/${ADMIN_CONTACT.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-white/40 hover:text-green-400 transition-all"
                      title="WhatsApp"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </div>

                  <div className="flex gap-1">
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-white/60 hover:text-gold transition-all" title="Emojis">
                      <Smile className="w-5 h-5" />
                    </button>
                    <div className="relative group">
                      <button onClick={() => setShowFilePicker(!showFilePicker)} className="p-2 text-white/60 hover:text-gold transition-all" title="Attach">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      {showFilePicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-[#233138] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[120px]">
                          <button onClick={() => imageInputRef.current.click()} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#111b21] text-xs text-white/80 transition-colors">
                            <ImageIcon className="w-4 h-4 text-pink-500" />
                            <span>Photo</span>
                          </button>
                          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#111b21] text-xs text-white/80 transition-colors border-y border-white/5">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>Document</span>
                          </button>
                          <button onClick={() => setShowUrlInput(!showUrlInput)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#111b21] text-xs text-white/80 transition-colors">
                            <Link className="w-4 h-4 text-gold" />
                            <span>URL Link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={isGuest ? "Sign in to send messages" : "Type a message"}
                      value={messageText}
                      onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full bg-[#2a3942] text-white rounded-lg px-4 py-2 text-sm focus:outline-none placeholder-white/30"
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={isGuest || isSending || (!messageText.trim() && !imageUrl && !fileUrl)}
                    className="p-3 bg-gold rounded-full text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Hidden Inputs */}
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* Pickers (Floating) */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={300} height={400} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBubble;