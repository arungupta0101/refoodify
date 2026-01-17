import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'NGO', text: 'Hello! Is the food still available?', time: '10:00 AM', self: false },
    { id: 2, sender: 'You', text: 'Yes, you can pick it up by 2 PM.', time: '10:05 AM', self: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'You', text: input, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), self: true }]);
    setInput('');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[80vh] flex flex-col">
          <div className="bg-primary p-6 text-white">
            <h1 className="text-xl font-bold">Direct Messages</h1>
            <p className="text-green-100 text-sm">Chat with NGOs & Donors</p>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-4 rounded-2xl ${msg.self ? 'bg-primary text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.self ? 'text-green-100' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..." 
              className="flex-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-primary"
            />
            <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-green-600 transition-all">
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}