import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaCopy, FaTrash, FaLightbulb } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Chatbot = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Finance Assistant. I can help you with budgeting, investment advice, financial planning, and answer questions about your transactions. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Show me my spending patterns',
        'How can I save more money?',
        'Investment tips for beginners',
        'Help me create a budget'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSuggestions = [
    'What are my top spending categories?',
    'How can I reduce my monthly expenses?',
    'Best investment options for my age?',
    'Help me set a savings goal',
    'Analyze my financial health',
    'Tax saving tips',
    'Emergency fund guidance',
    'Debt management strategies'
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Add typing delay for better UX
      setTimeout(async () => {
        try {
          const response = await axios.post(
            'http://localhost:5000/api/chatbot/ask',
            { message: inputMessage },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const botMessage = {
            id: Date.now() + 1,
            text: response.data.response,
            sender: 'bot',
            timestamp: new Date().toISOString(),
            suggestions: response.data.suggestions || []
          };

          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error('Chatbot API error:', error);
          
          // Fallback response with contextual advice
          const fallbackResponse = generateFallbackResponse(inputMessage);
          
          const botMessage = {
            id: Date.now() + 1,
            text: fallbackResponse.text,
            sender: 'bot',
            timestamp: new Date().toISOString(),
            suggestions: fallbackResponse.suggestions
          };

          setMessages(prev => [...prev, botMessage]);
        } finally {
          setIsTyping(false);
          setIsLoading(false);
        }
      }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
      return {
        text: "Creating a budget is essential for financial health! Here's a simple approach:\n\n1. Track your income and expenses\n2. Follow the 50/30/20 rule (50% needs, 30% wants, 20% savings)\n3. Use budgeting apps or spreadsheets\n4. Review and adjust monthly\n\nWould you like help setting up specific budget categories?",
        suggestions: ['Help me categorize expenses', 'What is the 50/30/20 rule?', 'Best budgeting apps']
      };
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return {
        text: "Great question about saving money! Here are proven strategies:\n\n💡 **Quick Wins:**\n• Automate savings transfers\n• Cancel unused subscriptions\n• Cook meals at home\n• Use cashback apps\n\n💡 **Long-term:**\n• Build an emergency fund (3-6 months expenses)\n• Invest in index funds\n• Consider high-yield savings accounts\n\nWhat's your current savings goal?",
        suggestions: ['Emergency fund tips', 'Best savings accounts', 'Investment basics']
      };
    }
    
    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return {
        text: "Investment advice for beginners:\n\n📈 **Start Here:**\n• Pay off high-interest debt first\n• Build emergency fund\n• Consider low-cost index funds\n• Diversify your portfolio\n\n📈 **Key Principles:**\n• Start early (compound interest!)\n• Invest regularly (dollar-cost averaging)\n• Stay disciplined during market volatility\n• Keep fees low\n\nRemember: I provide general information, not personalized investment advice. Consult a financial advisor for specific recommendations.",
        suggestions: ['What are index funds?', 'How much should I invest?', 'Risk tolerance assessment']
      };
    }
    
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      return {
        text: "Debt management strategies:\n\n🎯 **Debt Payoff Methods:**\n• **Snowball:** Pay minimums on all, extra on smallest balance\n• **Avalanche:** Pay minimums on all, extra on highest interest rate\n\n🎯 **Additional Tips:**\n• Consolidate high-interest debt\n• Negotiate with creditors\n• Consider balance transfers (0% APR offers)\n• Create a strict budget\n\nWhich method interests you most?",
        suggestions: ['Debt snowball vs avalanche', 'Balance transfer tips', 'Negotiating with creditors']
      };
    }
    
    return {
      text: "I'm here to help with your financial questions! I can assist with:\n\n💰 **Budgeting & Spending**\n💰 **Saving Strategies**\n💰 **Investment Basics**\n💰 **Debt Management**\n💰 **Financial Planning**\n\nWhat specific area would you like to explore?",
      suggestions: ['Create a budget', 'Saving tips', 'Investment advice', 'Debt payoff strategies']
    };
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Chat cleared! How can I help you with your finances today?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        suggestions: quickSuggestions.slice(0, 4)
      }
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <FaRobot className="h-6 w-6 mr-3" />
            <div>
              <h2 className="text-lg font-semibold">AI Finance Assistant</h2>
              <p className="text-sm opacity-90">Get personalized financial advice</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            title="Clear chat"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                } shadow-sm`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2">
                    {message.sender === 'user' ? (
                      <FaUser className="h-4 w-4 mt-1" />
                    ) : (
                      <FaRobot className="h-4 w-4 mt-1 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.sender === 'bot' && (
                        <button
                          onClick={() => copyMessage(message.text)}
                          className="text-xs opacity-75 hover:opacity-100 flex items-center"
                          title="Copy message"
                        >
                          <FaCopy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center mb-2">
                      <FaLightbulb className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-xs font-medium">Suggestions:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-2 py-1 bg-white bg-opacity-80 text-gray-700 rounded-full hover:bg-opacity-100 transition-colors border border-gray-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm flex items-center">
                <FaRobot className="h-4 w-4 text-green-600 mr-2" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (when no messages) */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick questions to get started:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your finances..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="1"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaPaperPlane className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
