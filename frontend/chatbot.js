// components/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContentRef = useRef(null);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { user: 'You', text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, { user: 'Bot', text: data.reply }]);
      
      if (data.qualifyLead) {
        setMessages(prevMessages => [
          ...prevMessages,
          { user: 'Bot', text: 'It seems like you're interested in speaking with a sales representative. Would you like me to connect you?' },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, { user: 'Bot', text: 'Error: Unable to connect to the server. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80">
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <MessageSquare size={24} />
        </button>
      )}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl flex flex-col h-[32rem]">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Support Chat</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">×</button>
          </div>
          <div ref={chatContentRef} className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.user === 'Bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] ${
                  msg.user === 'Bot' 
                    ? 'bg-gray-100 text-left' 
                    : 'bg-blue-100 text-right'
                } rounded-lg p-2 inline-block`}>
                  <p><strong>{msg.user}:</strong> {msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-2 inline-block">
                  <p>Bot is typing...</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button 
                onClick={sendMessage} 
                className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                disabled={isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
