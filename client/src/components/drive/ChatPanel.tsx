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
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-neo-bg border-l-4 border-black flex flex-col z-40 animate-in slide-in-from-right duration-500 shadow-neo">
      {/* Header */}
      <div className="h-[72px] flex items-center justify-between px-6 border-b-4 border-black flex-shrink-0 bg-white">
        <div className="flex items-center gap-2 text-black">
          <Sparkles className="w-6 h-6 text-brand-500" />
          <h3 className="font-bold tracking-wide uppercase">Workspace AI</h3>
        </div>
        <button
          onClick={() => setIsChatOpen(false)}
          className="p-2 border-2 border-transparent hover:border-black hover:bg-neo-pink rounded-none text-black font-bold transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex gap-3 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={clsx(
              "w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 border-2 border-black shadow-neo-sm",
              msg.role === 'user' ? "bg-neo-blue" : "bg-neo-yellow"
            )}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-black" /> : <Bot className="w-5 h-5 text-black" />}
            </div>
            <div className={clsx(
              "px-4 py-3 text-sm border-2 border-black font-medium shadow-neo-sm",
              msg.role === 'user' 
                ? "bg-white text-black" 
                : "bg-white text-black"
            )}>
              <div className="prose prose-sm max-w-none prose-p:leading-snug">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 bg-neo-yellow border-2 border-black shadow-neo-sm">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="px-4 py-3 bg-white border-2 border-black shadow-neo-sm flex items-center gap-2 text-black font-bold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-4 bg-white border-t-4 border-black">
        <form onSubmit={handleSubmit} className="relative flex items-center shadow-neo">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your files..."
            disabled={isLoading}
            className="w-full bg-white border-2 border-black text-black rounded-none pl-5 pr-12 py-4 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] text-sm placeholder-gray-500 disabled:opacity-50 transition-all font-bold"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-black bg-brand-500 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-black mt-4 font-bold tracking-widest uppercase">
          AI CAN MAKE MISTAKES. VERIFY IMPORTANT INFO.
        </p>
      </div>
    </div>
  );
}
