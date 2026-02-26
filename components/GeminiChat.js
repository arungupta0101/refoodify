import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';

// Advanced Siri-like circular animated icon
function AnimatedAIIcon() {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Outer rotating gradient ring */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #ff006e)',
          animation: 'spinFast 2s linear infinite',
          filter: 'blur(0.5px)',
        }}
      />
      
      {/* Secondary rotating ring (inverse) */}
      <div 
        className="absolute inset-1 rounded-full"
        style={{
          background: 'conic-gradient(from 180deg, #06ffa5, #ffbe0b, #ff006e, #8338ec, #3a86ff, #06ffa5)',
          animation: 'spinSlow 3s linear infinite reverse',
          opacity: 0.7,
        }}
      />

      {/* Light rays effect - top */}
      <div 
        className="absolute top-0 left-1/2 w-6 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
          transform: 'translateX(-50%)',
          animation: 'glow 1.5s ease-in-out infinite',
          filter: 'blur(1px)',
        }}
      />

      {/* Light rays effect - right */}
      <div 
        className="absolute right-0 top-1/2 h-6 w-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent)',
          transform: 'translateY(-50%)',
          animation: 'glow 1.5s ease-in-out infinite 0.5s',
          filter: 'blur(1px)',
        }}
      />

      {/* Light rays effect - bottom */}
      <div 
        className="absolute bottom-0 left-1/2 w-6 h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
          transform: 'translateX(-50%)',
          animation: 'glow 1.5s ease-in-out infinite 1s',
          filter: 'blur(1px)',
        }}
      />

      {/* Inner vibrant circle */}
      <div 
        className="absolute inset-2 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(99,102,241,0.8) 30%, rgba(139,92,246,0.9))',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />

      {/* Core gradient sphere */}
      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg" />
      
      {/* Center highlight/shine */}
      <div 
        className="absolute inset-4 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.2), transparent)',
          animation: 'shine 3s ease-in-out infinite',
        }}
      />

      {/* Floating particles around */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            top: '50%',
            left: '50%',
            animation: `orbit 3s linear infinite`,
            animationDelay: `${i * 1}s`,
            transformOrigin: '0 0',
            opacity: 0.8,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes spinFast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes shine {
          0%, 100% { transform: rotate(0deg) translateX(0); opacity: 0.6; }
          50% { transform: rotate(180deg); opacity: 0.9; }
        }
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(18px) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: rotate(360deg) translateX(18px) rotate(-360deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am your Refoodify AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not send message." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-gray-200 mb-4 animate-slideUp overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <AnimatedAIIcon />
              <h3 className="font-bold">Refoodify AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : msg.text.startsWith('AI Error') ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 p-2 bg-gray-100 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-white p-2 rounded-full shadow-lg hover:shadow-2xl hover:scale-125 transition-all flex items-center justify-center group"
      >
        {isOpen ? (
          <XMarkIcon className="w-8 h-8" />
        ) : (
          <div className="scale-150">
            <AnimatedAIIcon />
          </div>
        )}
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}