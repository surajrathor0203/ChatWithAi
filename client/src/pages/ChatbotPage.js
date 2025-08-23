import React, { useState, useEffect, useRef } from 'react';
import { useUserData, useSignOut } from '@nhost/react';
import { gql, useSubscription, useMutation, useQuery } from '@apollo/client';
import '../App.css';
import '../styles/ChatbotPage.css';

const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessagesUpdated($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      content
      is_bot
      created_at
    }
  }
`;

const GET_CHATS = gql`
  query GetChats($userId: uuid!) {
    chats(where: { user_id: { _eq: $userId } }) {
      id
      created_at
      title
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chatId, content: $content, is_bot: false }) {
      id
      content
    }
  }
`;

const CHATBOT_ACTION = gql`
  mutation ChatbotAction($chatId: uuid!, $message: String!) {
    sendMessage(input: { chat_id: $chatId, message_content: $message }) {
      reply
    }
  }
`;

const ChatbotPage = () => {
  const user = useUserData();
  const { signOut } = useSignOut();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChatTitle, setNewChatTitle] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: chatsData, loading: chatsLoading, refetch: refetchChats } = useQuery(GET_CHATS, {
    variables: { userId: user?.id },
    skip: !user?.id || user?.id === '',
  });

  const { data: messagesData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId: selectedChat },
    skip: !selectedChat || selectedChat === '',
  });

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted(data) {
      setSelectedChat(data.insert_chats_one.id);
      setNewChatTitle('');
      refetchChats();
      setError(null);
    },
    onError(err) {
      setError(err.message);
    },
  });

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [triggerChatbot] = useMutation(CHATBOT_ACTION);

  useEffect(() => {
    if (chatsData?.chats.length > 0 && !selectedChat) {
      setSelectedChat(chatsData.chats[0].id);
    }
  }, [chatsData, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const getUserInitials = () => {
    const name = user?.displayName || user?.email?.split('@')[0] || 'User';
    return name.split(' ').map(n => n).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatTitle) {
      alert('Missing chat title');
      return;
    }
    try {
      await createChat({
        variables: {
          title: newChatTitle,
        },
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Defensive check for invalid chatId or empty message
    if (!newMessage.trim() || !selectedChat || selectedChat === '') return;

    try {
      await sendMessageMutation({ variables: { chatId: selectedChat, content: newMessage } });
      await triggerChatbot({ variables: { chatId: selectedChat, message: newMessage } });
      setNewMessage('');
      setError(null);
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action(e);
    }
  };

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">{getUserInitials()}</div>
            <div className="user-details">
              <h2>Conversations</h2>
              {user && <div className="user-name">{user.displayName || user.email?.split('@')[0] || 'User'}</div>}
            </div>
          </div>
        </div>

        <div className="new-chat-form">
          <input
            type="text"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleCreateChat)}
            placeholder="Start new conversation..."
            className="new-chat-input"
          />
          <button onClick={handleCreateChat} className="new-chat-btn" disabled={!newChatTitle.trim()}>
            <span className="plus-icon"></span>
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {chatsLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Loading conversations...</span>
          </div>
        ) : (
          <ul className="chats-list">
            {chatsData?.chats.map((chat) => (
              <li key={chat.id}>
                <button className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`} onClick={() => setSelectedChat(chat.id)}>
                  <div className="chat-icon"></div>
                  <div className="chat-details">
                    <span className="chat-title">{chat.title || 'New Conversation'}</span>
                    <span className="chat-date">{formatTime(chat.created_at)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={() => signOut()} className="signout-btn">
          <span className="signout-icon"></span>Sign Out
        </button>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="messages-container">
              {messagesData?.messages.map((message) => (
                <div key={message.id} className={`message-wrapper ${message.is_bot ? 'bot' : 'user'}`}>
                  <div className="message-content">
                    <div className="message-avatar">{message.is_bot ? <div className="bot-icon"></div> : getUserInitials()}</div>
                    <div className="message-bubble">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button onClick={handleSendMessage} className="send-button" disabled={!newMessage.trim()}>
                <span className="send-icon"></span>
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat-state">
            <div className="empty-chat-graphic"></div>
            <h3>Start a Conversation</h3>
            <p>Select an existing chat or create a new one to begin chatting with your AI assistant.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;
