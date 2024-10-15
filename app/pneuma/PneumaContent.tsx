import React, { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';
import styles from '../styles/pneuma.module.css';
import { FiEdit2, FiCopy, FiCheck, FiX, FiRefreshCw, FiTrash2, FiSend } from 'react-icons/fi';
import AdvancedMarkdownRenderer from './AdvancedMarkdownRenderer';
import ThinkingIndicator from './ThinkingIndicator';

const DEFAULT_USER_NAME = process.env.NEXT_PUBLIC_USER_NAME || "H";
const AI_NAME = "Pneuma";
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/pneuma';

const PREDEFINED_SYSTEM_PROMPT = `You are Pneuma, an AI assistant designed to engage in meaningful conversations. Your responses should be thoughtful, empathetic, and tailored to the user's input. Always strive to understand the context and provide relevant, helpful information.`;

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
  systemPrompt: string;
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
  chatId: string;
  chatState: {
    messages: Message[];
    systemPrompt: string;
  };
  userInput: string;
  userName: string;
  isRegeneration: boolean;
  editedMessageId: string | null;
  userSettings: UserSettings;
  usePreDefinedPrompt: boolean;
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
      className={`${styles.message}`}
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
  const [chatId, setChatId] = useState<string>('');
  const [chat, setChat] = useState<Chat>({
    id: '',
    title: 'New Chat',
    createdAt: new Date(),
    userId: 'anonymous',
    messages: [],
    systemPrompt: ''
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(DEFAULT_USER_NAME);
  const [generatedSystemPrompt, setGeneratedSystemPrompt] = useState('');
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
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [regenerationAttempts, setRegenerationAttempts] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'fading' | 'sliding'>('idle');
  const [messagesToRemove, setMessagesToRemove] = useState<string[]>([]);

  const MAX_REGENERATION_ATTEMPTS = 3;

  const contentRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newChatId = uuidv4();
    setChatId(newChatId);
    setChat({
      id: newChatId,
      title: 'New Chat',
      createdAt: new Date(),
      userId: 'anonymous',
      messages: [],
      systemPrompt: ''
    });

    localStorage.removeItem('currentChat');
    localStorage.removeItem('chatId');

    setInputValue('');
    setError(null);
    setGeneratedSystemPrompt('');
    setEditingMessageId(null);
    setEditedContent('');
    setQueuePosition(null);
    setIsProcessing(false);
    setCopiedMessageId(null);
    setRegenerationAttempts(0);

    setUserSettings({
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1024,
      repetition_penalty: 1.05,
      min_p: 0.05,
      top_k: 0,
    });
  }, []);

  const pollQueuePosition = useCallback(async (requestId: string) => {
    while (true) {
      try {
        const response = await fetch(`${API_URL}?requestId=${requestId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Poll queue position response:", JSON.stringify(data, null, 2));

        setQueuePosition(data.queuePosition);
        setIsProcessing(data.status === 'processing');

        if (data.status === 'completed') {
          setIsLoading(false);
          setQueuePosition(null);
          setIsProcessing(false);
          
          if (data.result) {
            console.log("Completed request result:", JSON.stringify(data.result, null, 2));
            return data;
          } else {
            console.error("Completed request has no result:", data);
            throw new Error('Completed request has no result');
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error polling queue position:', error);
        setError(error instanceof Error ? error.message : 'Error checking queue position. Please try again.');
        throw error;
      }
    }
  }, []);

  const addMessage = useCallback((newMessage: Message) => {
    setChat(prevChat => {
      const updatedMessages = [...prevChat.messages, { ...newMessage, status: 'entering' as MessageStatus }];
      return { ...prevChat, messages: updatedMessages };
    });
  
    setTimeout(() => {
      setChat(prevChat => {
        const updatedMessages = prevChat.messages.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'active' as MessageStatus } : msg
        );
        return { ...prevChat, messages: updatedMessages };
      });
    }, 50);
  }, []);

  const sendRequest = useCallback(async (isRegeneration: boolean = false, editedMessageId: string | null = null, userMessage: string = '') => {
    try {
      setIsLoading(true);
      setError(null);

      let messageToSend = userMessage || inputValue;
      let updatedMessages = [...chat.messages];

      console.log('sendRequest called with:', { isRegeneration, editedMessageId, userMessage });
      console.log('Initial messages:', updatedMessages);

      if (isRegeneration) {
        console.log('Handling regeneration');
      } else if (editedMessageId) {
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
        addMessage(newUserMessage);
        updatedMessages = [...updatedMessages, newUserMessage];
      }

      console.log('Messages to be sent:', updatedMessages);

      const usePreDefinedPrompt = updatedMessages.length <= 3;

      const apiRequest: ApiRequest = {
        chatId,
        chatState: {
          messages: updatedMessages,
          systemPrompt: usePreDefinedPrompt ? PREDEFINED_SYSTEM_PROMPT : chat.systemPrompt
        },
        userInput: messageToSend,
        userName: userName,
        isRegeneration,
        editedMessageId,
        userSettings,
        usePreDefinedPrompt
      };

      console.log('API request:', apiRequest);
      console.log('Sending request to:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequest),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log("Received response data:", JSON.stringify(data, null, 2));

      if (data.requestId) {
        const pollResult = await pollQueuePosition(data.requestId);
        console.log("Poll result:", JSON.stringify(pollResult, null, 2));
        
        if (pollResult.result && Array.isArray(pollResult.result.messages) && pollResult.result.messages.length > 0) {
          const lastMessage = pollResult.result.messages[pollResult.result.messages.length - 1];
          if (lastMessage && typeof lastMessage.content === 'string') {
            const newAssistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: lastMessage.content,
              status: 'entering'
            };
            addMessage(newAssistantMessage);
            setGeneratedSystemPrompt(pollResult.result.systemPrompt || '');
          } else {
            console.error('Unexpected message format:', lastMessage);
            throw new Error('Received an invalid message format from the server');
          }
        } else {
          console.error('Unexpected data format:', pollResult);
          throw new Error('Received an unexpected data format from the server');
        }
      } else {
        throw new Error('Failed to get a request ID');
      }

      if (isRegeneration && !error) {
        setRegenerationAttempts(0);
      }

      if (!isRegeneration && !editedMessageId) {
        setInputValue('');
      }

    } catch (error) {
      console.error('Error in sendRequest:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      if (isRegeneration) {
        setRegenerationAttempts(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
      setQueuePosition(null);
      setIsProcessing(false);
    }
  }, [chatId, chat.messages, chat.systemPrompt, inputValue, editedContent, userName, userSettings, pollQueuePosition, error, addMessage]);

  const debouncedSendRequest = useCallback(
    debounce((isRegeneration: boolean, editedMessageId: string | null, message: string) => {
      sendRequest(isRegeneration, editedMessageId, message);
    }, 300),
    [sendRequest]
  );

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

  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
    
    debouncedSendRequest(false, null, messageToSend);
  };

  const deleteLastTurn = useCallback(() => {
    console.log('Delete Last Turn called');
  
    if (animationPhase !== 'idle') return;
  
    setChat(prevChat => {
      const messages = [...prevChat.messages];
      
      let lastBotIndex = messages.length - 1;
      while (lastBotIndex >= 0 && messages[lastBotIndex].role !== 'assistant') {
        lastBotIndex--;
      }
  
      let lastUserIndex = lastBotIndex - 1;
      while (lastUserIndex >= 0 && messages[lastUserIndex].role !== 'user') {
        lastUserIndex--;
      }
  
      if (lastBotIndex >= 0 && lastUserIndex >= 0) {
        const toRemove = [messages[lastUserIndex].id, messages[lastBotIndex].id];
        setMessagesToRemove(toRemove);
  
        // Mark messages for removal
        messages[lastUserIndex] = { ...messages[lastUserIndex], status: 'exiting' as MessageStatus };
        messages[lastBotIndex] = { ...messages[lastBotIndex], status: 'exiting' as MessageStatus };
  
        setAnimationPhase('fading');
  
        return { ...prevChat, messages };
      }
  
      return prevChat;
    });
  }, [animationPhase]);

  useEffect(() => {
    if (animationPhase === 'fading') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        setChat(prevChat => {
          const updatedMessages = prevChat.messages.filter(m => !messagesToRemove.includes(m.id));
          const removedHeight = calculateRemovedHeight();
          chatWindowRef.current?.style.setProperty('--slide-distance', `${removedHeight}px`);
          return {
            ...prevChat,
            messages: updatedMessages.map(m => ({ ...m, status: 'sliding' as MessageStatus }))
          };
        });
        setAnimationPhase('sliding');
      }, 300); // Duration of the fade-out animation
    }

    if (animationPhase === 'sliding') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        setChat(prevChat => ({
          ...prevChat,
          messages: prevChat.messages.map(m => ({ ...m, status: 'active' as MessageStatus }))
        }));
        setAnimationPhase('idle');
        chatWindowRef.current?.style.removeProperty('--slide-distance');
      }, 500); // Duration of the slide-down animation
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [animationPhase, messagesToRemove]);

  const calculateRemovedHeight = useCallback(() => {
    if (!chatWindowRef.current) return 0;
    
    const messagesToRemoveElements = messagesToRemove.map(id => 
      chatWindowRef.current!.querySelector(`[data-message-id="${id}"]`) as HTMLElement
    );

    return messagesToRemoveElements.reduce((total, el) => total + (el?.offsetHeight || 0), 0);
  }, [messagesToRemove]);

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
    const lastAssistantIndex = chat.messages.findLastIndex(m => m.role === 'assistant');
    
    if (lastUserIndex !== -1 && lastAssistantIndex > lastUserIndex) {
      // Start the fade-out animation
      setChat(prevChat => ({
        ...prevChat,
        messages: prevChat.messages.map((m, index) => 
          index === lastAssistantIndex 
            ? { ...m, status: 'exiting' as MessageStatus } 
            : m
        )
      }));

      // Wait for the fade-out animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove the last assistant message
      setChat(prevChat => ({
        ...prevChat,
        messages: prevChat.messages.filter((_, index) => index !== lastAssistantIndex)
      }));

      const lastUserMessage = chat.messages[lastUserIndex];

      setRegenerationAttempts(prev => prev + 1);

      await sendRequest(true, null, lastUserMessage.content);
    } else {
      setError("No user message found to regenerate response.");
    }
  }, [chat.messages, sendRequest, regenerationAttempts, MAX_REGENERATION_ATTEMPTS]);

  const handleReset = useCallback(() => {
    if (!isLoading) {
      setChat({
        id: uuidv4(),
        title: 'New Chat',
        createdAt: new Date(),
        userId: 'anonymous',
        messages: [],
        systemPrompt: ''
      });
      localStorage.removeItem('currentChat');
      setQueuePosition(null);
      setIsProcessing(false);
      setGeneratedSystemPrompt('');
      setRegenerationAttempts(0);
    }
  }, [isLoading]);

  const toggleSettings = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  const updateUserSetting = useCallback((key: keyof UserSettings, value: number) => {
    setUserSettings((prev: UserSettings) => {
      const updatedValue = Number(value);
      if (isNaN(updatedValue)) return prev;
      
      const { min, max } = getSliderProps(key);
      const clampedValue = Math.min(Math.max(updatedValue, min), max);
      
      return { ...prev, [key]: clampedValue };
    });
  }, []);

  const handleSliderChange = useCallback((e: ChangeEvent<HTMLInputElement>, key: keyof UserSettings) => {
    updateUserSetting(key, Number(e.target.value));
  }, [updateUserSetting]);

  const handleSettingInputChange = useCallback((e: ChangeEvent<HTMLInputElement>, key: keyof UserSettings) => {
    updateUserSetting(key, Number(e.target.value));
  }, [updateUserSetting]);

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
    return value.toFixed(3);
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
              {chat.messages.map((message) => (
                <div 
                  key={message.id}
                  className={`${styles.messageWrapper} ${
                    message.status === 'sliding' && animationPhase === 'sliding' ? styles.messageSlidingDown : ''
                  }`}
                  data-status={message.status}
                  data-message-id={message.id}
                >
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
              ))}
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
                  onChange={handleTextAreaChange}
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
                disabled={chat.messages.length < 2 || isLoading || animationPhase !== 'idle'}
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
                    onChange={(e) => handleSliderChange(e, key as keyof UserSettings)}
                    className={styles.slider}
                  />
                  <input
                    type="number"
                    value={formatSettingValue(key, value)}
                    onChange={(e) => handleSettingInputChange(e, key as keyof UserSettings)}
                    className={styles.sliderValue}
                    step={step}
                    min={min}
                    max={max}
                  />
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