import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { PaperAirplaneIcon, PhotoIcon, MicrophoneIcon, PhoneIcon, VideoCameraIcon, StopIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function Chat() {
  const { user } = useAuth();
  const router = useRouter();
  const { withUser, name } = router.query; // Chatting with this User ID
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const scrollContainerRef = useRef(null);
  const prevMessagesLength = useRef(0);

  // Poll for new messages every 2 seconds (Real-time simulation)
  useEffect(() => {
    if (!user || !withUser) return;
    
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?user1=${user.uid}&user2=${withUser}`);
        const data = await res.json();
        // Only update if we have new messages to prevent unnecessary re-renders
        setMessages(prev => {
          if (prev.length !== data.length) return data;
          return prev;
        });
      } catch (error) {
        console.error("Chat Error", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Increased to 4s to reduce spam
    return () => clearInterval(interval);
  }, [user, withUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isInitialLoad = prevMessagesLength.current === 0 && messages.length > 0;
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.senderId === user?.uid;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;

    // Scroll only if: Initial Load OR My Message OR User is already near bottom
    if (isInitialLoad || isMyMessage || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, user]); 

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    setIsSending(true);
    await sendMessage({ content: input, type: 'text' });
    setInput(''); 
    setIsSending(false);
  };

  const sendMessage = async (msgData) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.uid,
          receiverId: withUser,
          ...msgData
        })
      });
      // Optimistic update handled by polling or you can push manually here
    } catch (error) {
      toast.error("Failed to send");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ content: 'Image', type: 'image', fileUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
           await sendMessage({ content: 'Voice Message', type: 'audio', fileUrl: reader.result });
        };
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-4 px-2 md:px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[85vh] flex flex-col">
          
          {/* Chat Header */}
          <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                {name ? name[0] : 'U'}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{name || 'Chat'}</h1>
                <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => toast('Voice Call Coming Soon!')} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all"><PhoneIcon className="w-5 h-5" /></button>
               <button onClick={() => toast('Video Call Coming Soon!')} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all"><VideoCameraIcon className="w-5 h-5" /></button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#e5ddd5] bg-opacity-30">
            {messages.map(msg => (
              <div key={msg._id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative ${msg.senderId === user.uid ? 'bg-green-100 text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                  
                  {msg.type === 'text' && <p className="text-sm">{msg.content}</p>}
                  
                  {msg.type === 'image' && (
                    <img src={msg.fileUrl} alt="Shared" className="rounded-lg max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl)} />
                  )}
                  
                  {msg.type === 'audio' && (
                    <audio controls src={msg.fileUrl} className="w-48 h-8 mt-1" />
                  )}

                  <p className="text-[10px] text-gray-400 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-primary transition-colors">
              <PhotoIcon className="w-6 h-6" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type a message..." 
              className="flex-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 ring-primary"
            />
            
            {input.trim() && !isSending ? (
              <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-green-600 transition-all shadow-lg transform active:scale-95">
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            ) : (
              <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`p-3 rounded-xl transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white hover:bg-green-600'}`}>
                {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
              </button>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}