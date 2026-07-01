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
  const audioRefs = useRef({});
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const isReady = Boolean(user && withUser);

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

  const toggleAudio = async (messageId) => {
    const audio = audioRefs.current[messageId];
    if (!audio) return;

    if (playingAudioId === messageId) {
      audio.pause();
      setPlayingAudioId(null);
      return;
    }

    if (playingAudioId && audioRefs.current[playingAudioId]) {
      audioRefs.current[playingAudioId].pause();
    }

    try {
      await audio.play();
      setPlayingAudioId(messageId);
    } catch (error) {
      toast.error('Audio playback failed');
    }
  };

  const handleAudioProgress = (messageId, audio) => {
    const duration = audio.duration || 0;
    const currentTime = audio.currentTime || 0;
    const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
    setAudioProgress((prev) => ({
      ...prev,
      [messageId]: { progress, currentTime, duration }
    }));
  };

  const formatAudioTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const partnerName = typeof name === 'string' && name.trim() ? name.trim() : 'Chat';
  const partnerInitial = partnerName.slice(0, 1).toUpperCase();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-24 pb-8">
        <div className="section-shell">
          <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 text-lg font-semibold text-emerald-700">
                  {partnerInitial}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-slate-900">{partnerName}</h1>
                  <p className="flex items-center gap-2 text-sm text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toast('Voice Call Coming Soon!')} aria-label="Start voice call" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <button onClick={() => toast('Video Call Coming Soon!')} aria-label="Start video call" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                  <VideoCameraIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-slate-50/80 px-4 py-5 sm:px-6">
              {!isReady || messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                    <p className="text-lg font-semibold text-slate-900">Start the conversation</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Messages you send here will appear in this thread and stay linked to the donation request.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user.uid;
                    return (
                      <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] rounded-2xl border px-4 py-3 shadow-sm ${isOwnMessage ? 'border-emerald-600 bg-emerald-600 text-white rounded-br-md' : 'border-slate-200 bg-white text-slate-800 rounded-bl-md'}`}>
                          {msg.type === 'text' && <p className="whitespace-pre-wrap text-sm leading-6">{msg.content}</p>}

                          {msg.type === 'image' && (
                            <img src={msg.fileUrl} alt="Shared" className="max-h-64 w-full rounded-xl object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
                          )}

                          {msg.type === 'audio' && (
                            <div className={`min-w-[240px] rounded-2xl border px-4 py-3 ${isOwnMessage ? 'border-emerald-500/30 bg-white/10' : 'border-slate-200 bg-slate-50'}`}>
                              <audio
                                ref={(el) => {
                                  if (el) {
                                    audioRefs.current[msg._id] = el;
                                  }
                                }}
                                src={msg.fileUrl}
                                preload="metadata"
                                onTimeUpdate={(event) => handleAudioProgress(msg._id, event.currentTarget)}
                                onLoadedMetadata={(event) => handleAudioProgress(msg._id, event.currentTarget)}
                                onEnded={() => setPlayingAudioId(null)}
                                className="hidden"
                              />
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleAudio(msg._id)}
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${isOwnMessage ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                                  aria-label={playingAudioId === msg._id ? 'Pause audio' : 'Play audio'}
                                >
                                  {playingAudioId === msg._id ? (
                                    <span className="block h-3 w-3 rounded-sm bg-current" />
                                  ) : (
                                    <span className="ml-0.5 border-y-[7px] border-l-[11px] border-y-transparent border-l-current" />
                                  )}
                                </button>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-500">
                                    <span>Voice note</span>
                                    <span>{formatAudioTime(audioProgress[msg._id]?.currentTime || 0)} / {formatAudioTime(audioProgress[msg._id]?.duration || 0)}</span>
                                  </div>
                                  <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                                    <div
                                      className="h-1.5 rounded-full bg-emerald-600 transition-all duration-150"
                                      style={{ width: `${audioProgress[msg._id]?.progress || 0}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className={`mt-2 text-[11px] ${isOwnMessage ? 'text-emerald-50/80' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
              <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <button type="button" onClick={() => fileInputRef.current.click()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:text-emerald-700">
                  <PhotoIcon className="h-5 w-5" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write a message..."
                  className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />

                {input.trim() && !isSending ? (
                  <button type="submit" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-transform hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0">
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                ) : (
                  <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-lg' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                    {isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}