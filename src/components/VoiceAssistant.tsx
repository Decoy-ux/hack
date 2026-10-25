import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, X, Bot } from 'lucide-react';
import { Language } from '../types';

interface VoiceAssistantProps {
  lang: Language;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: lang === 'ne'
        ? 'नमस्कार! म Sarkari-Sewa AI सहायक हुँ। तपाईंलाई कुन सेवा, कागजात ओसीआर, वा क्यु बारे जानकारी चाहिएको छ? बोल्नुहोस् वा लेख्नुहोस्।'
        : 'Hello! I am your Sarkari-Sewa AI Assistant. How can I assist you with document verification, task guides, or queue status today? Speak or type your question.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang === 'ne' ? 'ne-NP' : 'en-US';

        recognition.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setInputText(speechToText);
          setIsListening(false);
          handleSendMessage(speechToText);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(lang === 'ne' ? 'तपाईंको ब्राउजरले भ्वाइस रेकग्निशन समर्थन गर्दैन।' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, lang }),
      });

      const data = await res.json();
      const replyText = data.reply || (lang === 'ne' ? 'माफ गर्नुहोला, प्रतिक्रिया प्राप्त भएन।' : 'Sorry, no response received.');

      const assistantMsg = {
        sender: 'assistant' as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(replyText);
    } catch (err) {
      const errorMsg = {
        sender: 'assistant' as const,
        text: lang === 'ne' ? 'सर्भरसँग जडान हुन सकेन।' : 'Failed to connect to assistant service.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-full shadow-xl border border-slate-700 transition animate-bounce"
            title="Open AI Voice Assistant"
          >
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-xs">{lang === 'ne' ? 'AI सहायक' : 'AI Assistant'}</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white p-3 flex items-center justify-between border-b border-slate-800">
            <h3 className="font-bold text-xs">{lang === 'ne' ? 'AI सहायक' : 'AI Assistant'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-3 h-64 overflow-y-auto space-y-2 bg-slate-50 text-xs">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-lg max-w-[85%] ${msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-slate-500 italic">AI thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2 bg-white border-t border-slate-200 flex items-center space-x-1">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="..."
              className="flex-1 px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded"
            />
            <button onClick={() => handleSendMessage()} className="p-2 bg-slate-900 text-white rounded-lg"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  );
};
