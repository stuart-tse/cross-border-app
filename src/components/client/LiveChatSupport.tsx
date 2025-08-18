'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'CLIENT' | 'ADMIN';
  message: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

interface ChatTicket {
  id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CLIENT' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface LiveChatSupportProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const LiveChatSupport: React.FC<LiveChatSupportProps> = ({
  isOpen,
  onClose,
  userId,
  userName
}) => {
  const [currentTicket, setCurrentTicket] = useState<ChatTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !currentTicket) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      // Check for existing open ticket
      const response = await fetch('/api/support/chat/active');
      
      if (response.ok) {
        const data = await response.json();
        if (data.ticket) {
          setCurrentTicket(data.ticket);
          setMessages(data.ticket.messages || []);
        } else {
          // Create new ticket
          await createNewTicket();
        }
      } else {
        // Create new ticket if none exists
        await createNewTicket();
      }
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error initializing chat:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTicket = async () => {
    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'LIVE_CHAT',
          subject: 'Live Chat Support',
          description: 'Customer initiated live chat session'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTicket(data.ticket);
        setMessages([]);
        
        // Send welcome message
        await sendSystemMessage('Hello! How can we help you today?');
      } else {
        throw new Error('Failed to create chat ticket');
      }
    } catch (error) {
      console.error('Error creating chat ticket:', error);
    }
  };

  const sendSystemMessage = async (message: string) => {
    if (!currentTicket) return;

    const systemMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderType: 'ADMIN',
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTicket || isSending) return;

    setIsSending(true);
    
    try {
      // Add message to UI immediately
      const tempMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        senderId: userId,
        senderType: 'CLIENT',
        message: newMessage,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      const messageText = newMessage;
      setNewMessage('');

      // Send to server
      const response = await fetch(`/api/support/chat/${currentTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temp message with real message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? data.message : msg
          )
        );
        
        // Simulate admin response after a delay
        setTimeout(() => {
          simulateAdminResponse(messageText);
        }, 1000 + Math.random() * 2000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp_${Date.now()}`));
    } finally {
      setIsSending(false);
    }
  };

  const simulateAdminResponse = (userMessage: string) => {
    // Simple response simulation based on user message content
    let response = "Thank you for your message. Let me help you with that.";
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('booking') || lowerMessage.includes('reservation')) {
      response = "I can help you with booking-related questions. Could you please provide your booking reference number or more details about your request?";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('refund')) {
      response = "For payment-related inquiries, I'll need to verify some details. Please provide your booking ID and I'll look into this for you.";
    } else if (lowerMessage.includes('cancel')) {
      response = "I understand you'd like to cancel. Let me check the cancellation policy for your booking. Could you share your booking reference?";
    } else if (lowerMessage.includes('driver') || lowerMessage.includes('vehicle')) {
      response = "I can help you with driver and vehicle-related questions. What specific information do you need?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = `Hello ${userName}! Welcome to our support chat. How can I assist you today?`;
    }

    const adminMessage: ChatMessage = {
      id: `admin_${Date.now()}`,
      senderId: 'admin',
      senderType: 'ADMIN',
      message: response,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, adminMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endChat = async () => {
    if (!currentTicket) return;

    try {
      await fetch(`/api/support/chat/${currentTicket.id}/close`, {
        method: 'PUT'
      });
      
      setCurrentTicket(null);
      setMessages([]);
      onClose();
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-hot-pink to-deep-pink text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  connectionStatus === 'connected' ? 'bg-green-400' :
                  connectionStatus === 'connecting' ? 'bg-yellow-400' :
                  'bg-red-400'
                )} />
                <h3 className="text-title-sm font-semibold">Live Support</h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={endChat}
                className="text-white hover:bg-white/20"
              >
                End Chat
              </Button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-hot-pink border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-body-sm text-gray-600">Connecting to support...</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.senderType === 'CLIENT' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-xs px-4 py-2 rounded-lg',
                      message.senderType === 'CLIENT'
                        ? 'bg-hot-pink text-white'
                        : 'bg-gray-100 text-charcoal'
                    )}
                  >
                    <p className="text-body-sm">{message.message}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      message.senderType === 'CLIENT' ? 'text-pink-100' : 'text-gray-500'
                    )}>
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending || connectionStatus !== 'connected'}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending || connectionStatus !== 'connected'}
                className="bg-hot-pink hover:bg-deep-pink"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};