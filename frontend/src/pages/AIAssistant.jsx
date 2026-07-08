import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';
import { assistant as assistantApi } from '../services/api';
import toast from 'react-hot-toast';

// Simple Markdown-like renderer for rendering assistant bold text, lists, and paragraphs.
function ChatMessageContent({ content }) {
  if (!content) return null;

  const parseInlineMarkdown = (text) => {
    // Matches **text** and wraps in <strong>
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      const before = text.substring(lastIndex, match.index);
      const boldText = match[1];
      if (before) parts.push(before);
      parts.push(<strong key={match.index} className="font-semibold text-white">{boldText}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    const after = text.substring(lastIndex);
    if (after) parts.push(after);

    return parts.length > 0 ? parts : text;
  };

  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 text-sm md:text-base">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Unordered list items (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listText = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc pl-5 my-1 text-dark-200">
              <li>{parseInlineMarkdown(listText)}</li>
            </ul>
          );
        }

        // Ordered list items (1. 2. etc)
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (orderedMatch) {
          const listText = orderedMatch[2];
          return (
            <ol key={idx} className="list-decimal pl-5 my-1 text-dark-200">
              <li>{parseInlineMarkdown(listText)}</li>
            </ol>
          );
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-dark-200 leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **MediGuide AI Assistant**, specialized in medication guidance. I have analyzed your active prescriptions and medications to help you with:\n\n- Clarifying instructions or dosage rules\n- Understanding side effects & contraindications\n- Highlighting key drug/food interactions\n\nHow can I support you today?\n\n*Disclaimer: I am an AI assistant. I do not provide medical advice. Please consult your doctor for any changes to your treatment.*",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to history
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Exclude the first welcome message if it is too generic or keep it for context.
      // We will map role ('assistant' -> 'assistant', 'user' -> 'user')
      const conversationHistory = updatedMessages
        .slice(0, -1) // All messages except the last user message
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await assistantApi.chat({
        message: userMessage,
        conversation_history: conversationHistory,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('Could not connect to AI Assistant. Please try again.');
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I encountered an error while processing your request. Please try checking your internet connection and send your message again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary-400" />
            AI Assistant
          </h1>
          <p className="text-xs md:text-sm text-dark-400 mt-0.5">
            Contextual medication guidance and safety screening
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 2.0</span>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden min-h-0 relative">
        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl ${
                      isUser
                        ? 'bg-gradient-to-br from-primary-600 to-teal-600 text-white rounded-tr-none'
                        : 'bg-dark-800/40 backdrop-blur-md border border-dark-700/50 text-dark-200 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ChatMessageContent content={msg.content} />
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-primary-600/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Thinking indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-dark-800/40 backdrop-blur-md border border-dark-700/50 text-dark-400 rounded-tl-none flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium tracking-wide">Assistant is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer bar */}
        <div className="px-4 py-2 bg-dark-950/40 border-t border-dark-700/30 flex items-center gap-2 text-dark-500 text-[10px] md:text-xs">
          <AlertCircle className="w-4 h-4 text-dark-500 flex-shrink-0" />
          <span>Advice is informational and derived from your uploaded prescriptions. Always consult a healthcare professional.</span>
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="p-3 md:p-4 bg-dark-900/60 border-t border-dark-700/50 backdrop-blur-xl flex items-center gap-2 md:gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your message about your medications..."
            className="flex-1 input-field py-2.5 px-4 bg-dark-950/50 border-dark-700/60 text-white rounded-xl focus:border-primary-500/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary p-2.5 md:px-5 md:py-2.5 flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
