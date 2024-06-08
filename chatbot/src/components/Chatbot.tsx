import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../store/reducers/chatslice";
import "./Chatbot.css";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";

interface Message {
  text: string;
  sender: "user" | "bot";
  typewriter?: boolean;
  timestamp?: string;
}

interface TypewriterEffectProps {
  text: string;
  onComplete: () => void;
  speed?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  speed = 50,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [currentIndex, text, speed, onComplete]);

  return <div style={{ whiteSpace: "nowrap" }}>{displayedText}</div>;
};

const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { messages } = useSelector((state: any) => state.chatState);
  const dispatch = useDispatch();
  const [hasDisplayedWelcomeMessage, setHasDisplayedWelcomeMessage] =
    useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [messages]);

  const getCurrentTimestamp = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return now.toLocaleString("en-US", options);
  };

  useEffect(() => {
    if (
      !hasDisplayedWelcomeMessage &&
      isChatbotVisible &&
      messages.length === 0
    ) {
      const now = new Date();
      const hour = now.getHours();
      let greeting = "";

      if (hour < 12) {
        greeting = "Good morning!";
      } else if (hour < 18) {
        greeting = "Good afternoon!";
      } else {
        greeting = "Good evening!";
      }

      const welcomeMessage: Message = {
        text: `${greeting} Ask me about anything in the grid. I’m still in Beta, so please give feedback to help me improve.`,
        sender: "bot",
        typewriter: false,
      };

      dispatch(addMessage(welcomeMessage));
      setHasDisplayedWelcomeMessage(true);
    }

    if (isChatbotVisible && messages.length === 0) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [hasDisplayedWelcomeMessage, isChatbotVisible, dispatch, messages]);

  const generateSuggestions = () => {
    const suggestionQuestions = [
      "Is [Hotel/Venue] available for a show on [Date]?",
    ];
    setSuggestions(suggestionQuestions);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (suggestionSelected) {
      setSuggestions([]);
      setSuggestionSelected(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: "user",
      timestamp: getCurrentTimestamp(),
      typewriter: false,
    };
    dispatch(addMessage(userMessage));

    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        sender: "bot",
        typewriter: true,
      };
      dispatch(addMessage(botMessage));
      scrollToBottom();
    }, 1000);
  };

  const handleInputClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setSuggestions([]);
      setSuggestionSelected(false);
    }
  };

  const handleClose = () => {
    setIsChatbotVisible(false);
    setSuggestions([]);
  };

  const handleChatIconClick = () => {
    setIsChatbotVisible(true);
    setTimeout(scrollToBottom, 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestionSelected(true);
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col w-full max-w-md rounded-lg bg-white shadow-lg max-h-[90vh] overflow-hidden z-50">
      {!isChatbotVisible && (
        <div
          className="fixed bottom-[20px] right-[50px] z-100 cursor-pointer chat-icon-container"
          onClick={handleChatIconClick}
        >
          <div className="bg-[#eacb04] w-14 h-14 flex justify-center items-center rounded-full relative">
            <ChatIcon className="text-slate-800 dark:text-white text-md" />
            <span className="tooltip absolute w-24 bg-black bg-opacity-75 text-white text-center rounded-md p-1 bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 transition-opacity duration-300">
              Ask AI
            </span>
          </div>
        </div>
      )}

      {isChatbotVisible && (
        <div className="chat-container">
          <div
            className={`flex justify-between items-center p-2 border-b border-gray-300 ${
              isChatbotVisible
                ? "bg-gradient-to-r from-yellow-500 to-yellow-200"
                : "bg-white"
            }`}
          >
            <div className="text-slate-700 p-2 rounded-sm font-bold">
              CHATBOT
            </div>
            <button
              className="bg-none border-none cursor-pointer text-slate-800 p-2 font-extrabold text-md"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
          <div className="messages-container">
            <div className="messages">
              {messages.map((msg: Message, index: number) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.sender === "user" ? (
                    <AccountBoxIcon className="mr-2 user-icon" />
                  ) : (
                    <AccountCircleIcon className="mr-2 icon bot-icon" />
                  )}
                  <div className="message-content">
                    <div className="message-text">
                      {msg.typewriter &&
                      isTyping &&
                      index === messages.length - 1 ? (
                        <TypewriterEffect
                          text={msg.text}
                          speed={50}
                          onComplete={() => setIsTyping(false)}
                        />
                      ) : (
                        msg.text
                      )}
                    </div>
                    {msg.sender === "user" && (
                      <div className="text-[0.75em] text-gray-600 align-text-left">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          {!suggestionSelected && (
            <div className="flex flex-col p-2 bg-white">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="bg-[#cccccc] border-none p-2 text-slate-700 rounded-sm cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-2 border-t border-gray-300 bg-white sticky bottom-0 z-10"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onClick={handleInputClick}
              placeholder="Ask anything to CHATBOT..."
              className="flex-1 p-2 border border-gray-300 rounded-sm bg-white dark:text-slate-800 placeholder:text-gray-400 placeholder:text-sm placeholder:italic"
            />
            <button
              type="submit"
              className="p-2 border-none rounded-sm cursor-pointer text-slate-800"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
