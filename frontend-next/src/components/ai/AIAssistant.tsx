'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { aiApi } from '@/lib/api/ai';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  onClose?: () => void;
}

// Detect user's browser language
const detectLanguage = (): 'en' | 'es' => {
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('es') ? 'es' : 'en';
};

const getInitialMessage = (lang: 'en' | 'es') => {
  return lang === 'es'
    ? '¡Hola! Soy BuildBot, tu asistente de IA. Puedo ayudarte con estimaciones de proyectos, cálculos de materiales, programación y más. ¿En qué puedo ayudarte hoy?'
    : 'Hi! I\'m BuildBot, your AI assistant. I can help you with project estimates, material calculations, scheduling and more. How can I help you today?';
};

export function AIAssistant({ onClose }: AIAssistantProps = {}) {
  const { user } = useAuth();
  const [userLang] = useState<'en' | 'es'>(detectLanguage());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getInitialMessage(userLang),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      // Include language preference in the request
      const enhancedInput = userLang === 'es' 
        ? `[Responde en español] ${input}` 
        : input;
      
      const response = await aiApi.chat(enhancedInput, user?.userType || 'client', history) as any;

      if (response?.success && response?.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.message },
        ]);
      } else {
        const errorMsg = userLang === 'es'
          ? 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.'
          : 'Sorry, there was an error processing your message. Please try again.';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: errorMsg },
        ]);
      }
    } catch (error) {
      const errorMsg = userLang === 'es'
        ? 'Lo siento, ocurrió un error. Por favor intenta de nuevo más tarde.'
        : 'Sorry, an error occurred. Please try again later.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholder = userLang === 'es' 
    ? 'Pregúntale cualquier cosa a BuildBot...' 
    : 'Ask BuildBot anything...';

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-3">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-blue-600">
            {userLang === 'es' ? 'Asistente IA BuildBot' : 'AI Assistant BuildBot'}
          </h3>
          <p className="text-sm text-purple-600">
            {userLang === 'es' ? 'Tu experto en oficios 24/7' : 'Your 24/7 trades expert'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto mb-4 shadow-inner">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                  <p className="font-semibold text-sm text-gray-900 mb-1">BuildBot:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
                </div>
              )}
              
              {message.role === 'user' && (
                <div className="bg-blue-100 rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <Spinner size="sm" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 bg-blue-600 hover:bg-blue-700"
        >
          {userLang === 'es' ? 'Enviar' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
