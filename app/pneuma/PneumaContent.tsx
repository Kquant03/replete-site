import React, { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import debounce from 'lodash/debounce';
import styles from '../styles/pneuma.module.css';
import { FiEdit2, FiCopy, FiCheck, FiX, FiRefreshCw, FiTrash2, FiSend } from 'react-icons/fi';
import AdvancedMarkdownRenderer from './AdvancedMarkdownRenderer';
import ThinkingIndicator from './ThinkingIndicator';

const DEFAULT_USER_NAME = process.env.NEXT_PUBLIC_USER_NAME || "H";
const AI_NAME = "Pneuma";

type MessageStatus = 'entering' | 'active' | 'exiting' | 'sliding';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status: MessageStatus;
};

type Chat = {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  messages: Message[];
};

type UserSettings = {
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  min_p: number;
  top_k: number;
};

type ApiRequest = {
  messages: Message[];
  userInput: string;
  userName: string;
  userSettings: UserSettings;
  isRegeneration: boolean;  // Add this line
};

const MessageItem: React.FC<{
  message: Message;
  userName: string;
  editingMessageId: string | null;
  handleEdit: (id: string, content: string) => void;
  handleCopy: (id: string, content: string) => void;
  copiedMessageId: string | null;
  editedContent: string;
  handleSaveEdit: (id: string) => void;
  handleCancelEdit: () => void;
}> = React.memo(({ 
  message, 
  userName, 
  editingMessageId, 
  handleEdit, 
  handleCopy, 
  copiedMessageId, 
  editedContent, 
  handleSaveEdit, 
  handleCancelEdit
}) => {
  return (
    <div 
      className={styles.message}
      data-role={message.role}
      data-status={message.status}
    >
      <strong className={styles.messageSender}>
        {message.role === 'user' ? userName : AI_NAME}
      </strong>
      {editingMessageId === message.id && message.role === 'user' ? (
        <div className={styles.editMessageContainer}>
          <textarea
            value={editedContent}
            onChange={(e) => handleEdit(message.id, e.target.value)}
            className={styles.editMessageTextarea}
          />
          <div className={styles.editMessageActions}>
            <button onClick={() => handleSaveEdit(message.id)} className={styles.editActionButton}>
              <FiCheck />
            </button>
            <button onClick={handleCancelEdit} className={styles.editActionButton}>
              <FiX />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.messageContent}>
            <AdvancedMarkdownRenderer content={message.content} />
          </div>
          <div className={styles.messageActions}>
            <button 
              onClick={() => handleCopy(message.id, message.content)} 
              className={styles.actionButton}
              aria-label="Copy message"
            >
              {copiedMessageId === message.id ? <FiCheck /> : <FiCopy />}
            </button>
            {message.role === 'user' && (
              <button
                onClick={() => handleEdit(message.id, message.content)} 
                className={styles.actionButton}
                aria-label="Edit message"
              >
                <FiEdit2 />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const PneumaContent: React.FC = () => {
  const [chat, setChat] = useState<Chat>({
    id: uuidv4(),
    title: 'New Chat',
    createdAt: new Date(),
    userId: 'anonymous',
    messages: []
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024,
    repetition_penalty: 1.05,
    min_p: 0.05,
    top_k: 0,
  });
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [generatedSystemPrompt, setGeneratedSystemPrompt] = useState('');
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [regenerationAttempts, setRegenerationAttempts] = useState(0);
  const MAX_REGENERATION_ATTEMPTS = 3;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/pneuma';

  const contentRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setUserName(parsedSettings.userName);
      setUserSettings(parsedSettings.userSettings);
    }
  }, []);

  useEffect(() => {
    const settingsToSave = { userName, userSettings };
    localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
  }, [userName, userSettings]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chat.messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [isLoading]);

  const pollQueuePosition = useCallback(async (requestId: string) => {
    while (true) {
      try {
        const response = await fetch(`${API_URL}?requestId=${requestId}`);
        const data = await response.json();
        console.log("Poll queue position response:", data);
  
        if (!response.ok) {
          if (response.status === 404) {
            setError(data.error || "Request not found. It may have been cleaned up.");
            break;
          }
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
  
        setQueuePosition(data.queuePosition);
        setIsProcessing(data.status === 'processing');
  
        if (data.status === 'completed') {
          setIsLoading(false);
          setQueuePosition(null);
          setIsProcessing(false);      
          
          if (data.result) {
            setChat(prevChat => ({
              ...prevChat,
              messages: [
                ...prevChat.messages,
                {
                  id: uuidv4(),
                  role: 'assistant',
                  content: data.result.response,
                  status: 'entering'
                }
              ]
            }));
          // Update the system prompt if needed
      if (data.result.systemPrompt) {
        setGeneratedSystemPrompt(data.result.systemPrompt);
      }
    }
    break;
  }
  
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error polling queue position:', error);
        setError(error instanceof Error ? error.message : 'Error checking queue position. Please try again.');
        break;
      }
    }
  }, [API_URL, setChat, setError, setIsLoading, setIsProcessing, setQueuePosition, setGeneratedSystemPrompt]);

  const sendRequest = useCallback(async (isRegeneration: boolean = false, editedMessageId: string | null = null, userMessage: string = '', conversationHistory: Message[] = []) => {
    try {
      setIsLoading(true);
      setError(null);
  
      let messageToSend = userMessage || inputValue;
      let updatedMessages = isRegeneration ? conversationHistory : [...chat.messages];
  
      console.log('sendRequest called with:', { isRegeneration, editedMessageId, userMessage });
      console.log('Initial messages:', updatedMessages);
  
      if (!isRegeneration) {
        if (editedMessageId) {
          const editedMessageIndex = updatedMessages.findIndex(m => m.id === editedMessageId);
          if (editedMessageIndex !== -1) {
            updatedMessages = updatedMessages.slice(0, editedMessageIndex + 1);
            updatedMessages[editedMessageIndex] = { ...updatedMessages[editedMessageIndex], content: editedContent, status: 'active' };
          }
          messageToSend = editedContent;
        } else {
          const newUserMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: messageToSend,
            status: 'entering'
          };
          updatedMessages = [...updatedMessages, newUserMessage];
        }
      }
  
      console.log('Messages to be sent:', updatedMessages);
  
      const apiRequest: ApiRequest = {
        messages: updatedMessages,
        userInput: messageToSend,
        userName: userName,
        userSettings,
        isRegeneration,
      };
  
      console.log('API request:', apiRequest);
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequest),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Received response:", data);
  
      setQueuePosition(data.queuePosition);
      setIsProcessing(true);
  
      if (data.requestId) {
        await pollQueuePosition(data.requestId);
      } else {
        throw new Error('Failed to get a request ID');
      }
  
      if (isRegeneration) {
        setRegenerationAttempts(prev => prev + 1);
      } else {
        setRegenerationAttempts(0);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setQueuePosition(null);
      setIsProcessing(false);
    }
  }, [chat.messages, inputValue, editedContent, userName, pollQueuePosition, userSettings, API_URL]);

  const debouncedSendRequest = useCallback(
    (isRegeneration: boolean, editedMessageId: string | null, message: string) => {
      const debouncedFunction = debounce((isRegen: boolean, editedId: string | null, msg: string) => 
        sendRequest(isRegen, editedId, msg),
      300);
      debouncedFunction(isRegeneration, editedMessageId, message);
    },
    [sendRequest]
  );

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const adjustTextareaHeight = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [inputValue, adjustTextareaHeight]);

  const resetInputField = () => {
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const messageToSend = inputValue.trim();
    resetInputField();
    
    const newUserMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: messageToSend,
      status: 'entering'
    };
    setChat(prevChat => ({
      ...prevChat,
      messages: [...prevChat.messages, newUserMessage]
    }));

    debouncedSendRequest(false, null, messageToSend);
  };

  const deleteLastTurn = useCallback(() => {
    console.log('Delete Last Turn called');
    console.log('Current messages:', chat.messages);
  
    setChat(prevChat => {
      const messages = [...prevChat.messages];
      
      // Find the index of the last bot response
      let lastBotIndex = messages.length - 1;
      while (lastBotIndex >= 0 && messages[lastBotIndex].role !== 'assistant') {
        lastBotIndex--;
      }
  
      // Find the index of the last user message before the bot response
      let lastUserIndex = lastBotIndex - 1;
      while (lastUserIndex >= 0 && messages[lastUserIndex].role !== 'user') {
        lastUserIndex--;
      }
  
      console.log('Last bot response index:', lastBotIndex);
      console.log('Last user message index:', lastUserIndex);
  
      if (lastBotIndex >= 0 && lastUserIndex >= 0) {
        // Mark the last user message and bot response for deletion
        messages[lastUserIndex].status = 'exiting';
        messages[lastBotIndex].status = 'exiting';
  
        console.log('Marking for deletion:', messages[lastUserIndex], messages[lastBotIndex]);
  
        // Mark all other messages for sliding
        for (let i = 0; i < lastUserIndex; i++) {
          messages[i].status = 'sliding';
        }
  
        console.log('Updated messages:', messages);
        return { ...prevChat, messages };
      }
  
      console.log('No suitable turn found to delete');
      return prevChat;
    });
  
    // Remove exiting messages and reset sliding status after animation
    // Remove exiting messages and reset sliding status after animation
    setTimeout(() => {
      setChat(prevChat => {
        const updatedMessages = prevChat.messages
          .filter(m => m.status !== 'exiting')
          .map(m => ({ ...m, status: 'active' as const }));
        console.log('Messages after removal:', updatedMessages);
        return { ...prevChat, messages: updatedMessages };
      });
    }, 300); // Duration of exit animation
  }, [chat.messages]);
  
  const regenerateResponse = useCallback(async (event?: ReactMouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (chat.messages.length === 0) return;
  
    if (regenerationAttempts >= MAX_REGENERATION_ATTEMPTS) {
      setError("Maximum regeneration attempts reached. Please try again later.");
      return;
    }
  
    const lastUserIndex = chat.messages.findLastIndex(m => m.role === 'user');
    
    if (lastUserIndex !== -1) {
      setChat(prevChat => ({
        ...prevChat,
        messages: prevChat.messages.map((m, index) => 
          index > lastUserIndex ? { ...m, status: 'exiting' as const } : m
        )
      }));
  
      setTimeout(() => {
        setChat(prevChat => {
          const updatedMessages = prevChat.messages
            .filter(m => m.status !== 'exiting')
            .map(m => ({ ...m, status: 'active' as const }));
          return { ...prevChat, messages: updatedMessages };
        });
  
        const messagesToSend = chat.messages.slice(0, lastUserIndex + 1);
        const lastUserMessage = chat.messages[lastUserIndex];
        sendRequest(true, null, lastUserMessage.content, messagesToSend);
      }, 300); // This should match the animation duration in CSS
    } else {
      setError("No user message found to regenerate response.");
    }
  }, [chat.messages, sendRequest, regenerationAttempts, MAX_REGENERATION_ATTEMPTS, setChat, setError]);

  const handleReset = useCallback(() => {
    if (!isLoading) {
      setChat({
        id: uuidv4(),
        title: 'New Chat',
        createdAt: new Date(),
        userId: 'anonymous',
        messages: []
      });
      setQueuePosition(null);
      setIsProcessing(false);
      setRegenerationAttempts(0);
    }
  }, [isLoading]);

  const toggleSettings = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  const updateUserSetting = useCallback((key: keyof UserSettings, value: number) => {
    setUserSettings((prev: UserSettings) => ({ ...prev, [key]: Number(value) }));
  }, []);

  const getSliderProps = useCallback((key: keyof UserSettings) => {
    switch (key) {
      case 'temperature':
        return { min: 0, max: 1.5, step: 0.01 };
      case 'top_p':
        return { min: 0, max: 1, step: 0.01 };
      case 'max_tokens':
        return { min: 512, max: 2048, step: 1 };
      case 'repetition_penalty':
        return { min: 1, max: 1.5, step: 0.01 };
      case 'min_p':
        return { min: 0, max: 1, step: 0.005 };
      case 'top_k':
        return { min: 0, max: 100, step: 1 };
      default:
        return { min: 0, max: 1, step: 0.01 };
    }
  }, []);

  const formatSettingValue = useCallback((key: string, value: number) => {
    if (key === 'max_tokens' || key === 'top_k') {
      return value.toFixed(0);
    }
    return value.toFixed(2);
  }, []);

  const handleCopy = useCallback((messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  }, []);

  const handleEdit = useCallback((messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditedContent('');
  }, []);

  const handleSaveEdit = useCallback(async (messageId: string) => {
    const editedMessageIndex = chat.messages.findIndex(m => m.id === messageId);
    if (editedMessageIndex === -1) return;

    const originalContent = chat.messages[editedMessageIndex].content;
    if (originalContent === editedContent) {
      handleCancelEdit();
      return;
    }

    setChat(prevChat => {
      const updatedMessages = prevChat.messages.slice(0, editedMessageIndex + 1);
      updatedMessages[editedMessageIndex] = {
        ...updatedMessages[editedMessageIndex],
        content: editedContent,
        status: 'active'
      };
      return { ...prevChat, messages: updatedMessages };
    });

    setEditingMessageId(null);
    setEditedContent('');

    debouncedSendRequest(false, messageId, editedContent);
  }, [chat.messages, editedContent, debouncedSendRequest, handleCancelEdit]);

  return (
    <div ref={contentRef} className={styles.pneumaContainer}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <main className={styles.main}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>Pneuma</h1>
              <p className={styles.description}>
                Meet Pneuma, our AI companion designed for genuine and meaningful conversations.
              </p>
            </div>
  
            <div className={styles.chatWindow} ref={chatWindowRef}>
              <TransitionGroup>
                {chat.messages.map((message) => (
                  <CSSTransition
                    key={message.id}
                    timeout={300}
                    classNames={{
                      enter: styles.messageEnter,
                      enterActive: styles.messageEnterActive,
                      exit: styles.messageExit,
                      exitActive: styles.messageExitActive,
                    }}
                  >
                    <div className={`${styles.messageWrapper} ${message.status === 'sliding' ? styles.messageSliding : ''}`}>
                      <MessageItem
                        message={message}
                        userName={userName}
                        editingMessageId={editingMessageId}
                        handleEdit={handleEdit}
                        handleCopy={handleCopy}
                        copiedMessageId={copiedMessageId}
                        editedContent={editedContent}
                        handleSaveEdit={handleSaveEdit}
                        handleCancelEdit={handleCancelEdit}
                      />
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </div>

            <div className={styles.thinkingIndicatorContainer}>
              <ThinkingIndicator isVisible={isLoading || isProcessing} queuePosition={queuePosition} />
            </div>
  
            {error && (
              <div className={styles.errorMessage}>
                Error: {error}
                <button onClick={() => debouncedSendRequest(false, null, '')} className={styles.retryButton}>
                  Retry
                </button>
              </div>
            )}
  
            <form onSubmit={handleSubmit} className={styles.inputForm}>
              <div className={styles.inputWrapper}>
                <textarea
                  ref={textareaRef}
                  placeholder={`${userName}, type your message...`}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={styles.inputField}
                  rows={1}
                />
                <button type="submit" className={styles.sendButton} disabled={isLoading || inputValue.trim() === ''}>
                  <FiSend />
                </button>
              </div>
            </form>
  
            <div className={styles.buttonContainer}>
              <button 
                onClick={deleteLastTurn} 
                className={styles.secondaryButton}
                disabled={chat.messages.length < 2 || isLoading}
              >
                <FiTrash2 /> Delete Last Turn
              </button>
              <button 
                onClick={regenerateResponse} 
                className={styles.secondaryButton}
                disabled={chat.messages.length === 0 || isLoading}
              >
                <FiRefreshCw /> Regenerate
              </button>
              <button 
                onClick={handleReset} 
                className={styles.secondaryButton}
                disabled={isLoading}
              >
                Reset Conversation
              </button>
              <button onClick={toggleSettings} className={styles.primaryButton}>
                {isPanelVisible ? 'Hide Interaction State' : 'Show Interaction State'}
              </button>
            </div>
          </main>
        </div>
      </div>
  
      {/* Settings Panel */}
  <div 
    className={`${styles.settingsPanel} ${isPanelVisible ? styles.visible : ''}`}
    aria-hidden={!isPanelVisible}
  >
    <div className={styles.settingsPanelContent}>
      <div className={styles.settingsPanelHeader}>
        <h2>Interaction State</h2>
        <button 
          className={styles.closeSettings} 
          onClick={toggleSettings} 
          aria-label="Close settings"
        >
          <FiX />
        </button>
      </div>
        
      <div className={styles.settingGroup}>
        <label htmlFor="userName" className={styles.settingLabel}>Your Name:</label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className={styles.settingInput}
        />
      </div>

      <div className={styles.settingGroup}>
        <label htmlFor="generatedSystemPrompt" className={styles.settingLabel}>Generated System Prompt:</label>
        <textarea
          id="generatedSystemPrompt"
          value={generatedSystemPrompt}
          readOnly
          className={styles.settingTextarea}
        ></textarea>
      </div>

      <h3 className={styles.settingSectionTitle}>Model Parameters</h3>
      {Object.entries(userSettings).map(([key, value]) => {
        const { min, max, step } = getSliderProps(key as keyof UserSettings);
        return (
          <div key={key} className={styles.sliderContainer}>
            <label htmlFor={`setting-${key}`} className={styles.settingLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
            </label>
            <div className={styles.sliderGroup}>
              <input
                id={`setting-${key}`}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateUserSetting(key as keyof UserSettings, parseFloat(e.target.value))
                }
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{formatSettingValue(key, value)}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
    </div>
  );
};

export default PneumaContent;