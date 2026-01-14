import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  // Initial welcome message
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am the SkillHub Assistant. Ask me anything about the platform!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // ✅ CONNECTION: Send to your Python Backend
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      
      // ✅ DISPLAY: Add the backend's reply to the UI
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "Sorry, I can't reach the server. Is the Python backend running?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-lg shadow-2xl border border-gray-200 flex flex-col mb-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow">
            <h3 className="font-bold flex items-center gap-2">
               <MessageCircle size={20} /> SkillHub AI
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-gray-200 p-2 rounded-lg rounded-bl-none flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="animate-spin" size={14} /> Thinking...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Ask about SkillHub..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}