import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { aiApi, ChatMessage } from '@/services/ai.service';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

export function ChatPanel() {
  const { isChatOpen, setIsChatOpen } = useUIStore();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folder') || 'root';
  
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Hi! I'm your AI assistant. Ask me anything about the files in this folder."
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Reset chat when folder changes
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hi! I'm your AI assistant. Ask me anything about the files in this folder.`
    }]);
  }, [folderId]);

  if (!isChatOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await aiApi.chat(newMessages, folderId, null);
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: data.data.answer,
      }]);
    } catch (error: any) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Sorry, I encountered an error while trying to answer that. Please ensure your AI keys are configured."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col z-40 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0 bg-gray-950/50">
        <div className="flex items-center gap-2 text-brand-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Workspace Chat</h3>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex gap-3 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === 'user' ? "bg-brand-600" : "bg-purple-600"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div className={clsx(
              "px-4 py-3 text-sm",
              msg.role === 'user' 
                ? "bg-brand-600 text-white rounded-2xl rounded-tr-sm" 
                : "bg-gray-800 text-gray-200 rounded-2xl rounded-tl-sm border border-gray-700"
            )}>
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-purple-600">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 rounded-tl-sm flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your files..."
            disabled={isLoading}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm placeholder-gray-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 text-brand-500 hover:text-brand-400 disabled:opacity-50 disabled:hover:text-brand-500 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-500 mt-2">
          AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
