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
    chats(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
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

const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_chats_by_pk(id: $chatId) {
      id
    }
  }
`;

const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chatId: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: {id: $chatId}, _set: {title: $title}) {
      id
      title
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
  const [botTyping, setBotTyping] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
  const [deleteChatMutation] = useMutation(DELETE_CHAT);
  const [updateChatTitleMutation] = useMutation(UPDATE_CHAT_TITLE);

  useEffect(() => {
    if (chatsData?.chats.length > 0 && !selectedChat) {
      setSelectedChat(chatsData.chats[0].id); // chats[0] is now the latest chat
    }
  }, [chatsData, selectedChat]);

  useEffect(() => {
    // Hide typing indicator when a new bot message arrives
    if (botTyping && messagesData?.messages.length > 0) {
      const lastMsg = messagesData.messages[messagesData.messages.length - 1];
      if (lastMsg.is_bot) setBotTyping(false);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

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
    if (!newMessage.trim() || !selectedChat || selectedChat === '') return;

    setBotTyping(true); // Show typing indicator
    setNewMessage('');  // Clear input immediately

    try {
      await sendMessageMutation({ variables: { chatId: selectedChat, content: newMessage } });
      await triggerChatbot({ variables: { chatId: selectedChat, message: newMessage } });
      setError(null);
    } catch (err) {
      setError('Failed to send message.');
      setBotTyping(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    setConfirmDeleteId(chatId);
  };

  const confirmDeleteChat = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteChatMutation({ variables: { chatId: confirmDeleteId } });
      refetchChats();
      if (selectedChat === confirmDeleteId) {
        const remainingChats = chatsData?.chats.filter(c => c.id !== confirmDeleteId);
        setSelectedChat(remainingChats?.[0]?.id || null);
      }
      setConfirmDeleteId(null);
    } catch (err) {
      setError('Failed to delete chat.');
      setConfirmDeleteId(null);
    }
  };

  const cancelDeleteChat = () => {
    setConfirmDeleteId(null);
  };

  const startEditChatTitle = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle || '');
  };

  const saveEditChatTitle = async (chatId) => {
    if (!editingTitle.trim()) return;
    try {
      await updateChatTitleMutation({ variables: { chatId, title: editingTitle } });
      setEditingChatId(null);
      setEditingTitle('');
      refetchChats();
    } catch (err) {
      setError('Failed to update chat title.');
    }
  };

  const cancelEditChatTitle = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action(e);
    }
  };

  const handleSignOutClick = () => {
    setConfirmSignOut(true);
  };

  const confirmSignOutAction = () => {
    setConfirmSignOut(false);
    signOut();
  };

  const cancelSignOutAction = () => {
    setConfirmSignOut(false);
  };

  return (
    <div className="chat-layout">
      {/* Mobile three-dot button */}
      {isMobile && (
        <button
          className="mobile-sidebar-toggle"
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1100,
            background: 'rgba(31,41,55,0.8)',
            border: 'none',
            borderRadius: '0.75rem',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <span style={{
            width: '1.5rem',
            height: '1.5rem',
            display: 'block',
            backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"white\" viewBox=\"0 0 24 24\"><circle cx=\"5\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"19\" cy=\"12\" r=\"2\"/></svg>')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></span>
        </button>
      )}

      {/* Sidebar overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1099,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="chat-sidebar"
        style={
          isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: sidebarOpen ? 0 : '-100%',
                height: '100vh',
                width: '320px',
                zIndex: 1101,
                transition: 'left 0.3s',
                boxShadow: sidebarOpen ? '2px 0 16px rgba(0,0,0,0.2)' : 'none',
                background: 'rgba(31,41,55,0.95)',
                display: 'block',
              }
            : {}
        }
      >
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                    onClick={() => { setSelectedChat(chat.id); if (isMobile) setSidebarOpen(false); }}
                    style={{ flex: 1 }}
                  >
                    <div className="chat-icon"></div>
                    <div className="chat-details">
                      {editingChatId === chat.id ? (
                        <span>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={e => setEditingTitle(e.target.value)}
                            style={{
                              fontSize: '0.875rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #8b5cf6',
                              padding: '0.25rem 0.5rem',
                              width: '70%',
                            }}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditChatTitle(chat.id);
                              if (e.key === 'Escape') cancelEditChatTitle();
                            }}
                          />
                          <button
                            style={{
                              marginLeft: '0.25rem',
                              background: 'none',
                              border: 'none',
                              color: '#8b5cf6',
                              cursor: 'pointer',
                            }}
                            title="Save"
                            onClick={() => saveEditChatTitle(chat.id)}
                          >✔</button>
                          <button
                            style={{
                              marginLeft: '0.25rem',
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                            title="Cancel"
                            onClick={cancelEditChatTitle}
                          >✖</button>
                        </span>
                      ) : (
                        <span className="chat-title">
                          {chat.title || 'New Conversation'}
                          <button
                            style={{
                              marginLeft: '0.5rem',
                              background: 'none',
                              border: 'none',
                              color: '#38bdf8',
                              cursor: 'pointer',
                              fontSize: '1rem',
                            }}
                            title="Edit chat name"
                            onClick={e => {
                              e.stopPropagation();
                              startEditChatTitle(chat.id, chat.title);
                            }}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0l-9.192 9.192A2 2 0 004 13.586V16a1 1 0 001 1h2.414a2 2 0 001.414-.586l9.192-9.192a2 2 0 000-2.828l-2.414-2.414zM5 15v-2.414l9-9L16.414 6l-9 9H5z"/>
                            </svg>
                          </button>
                        </span>
                      )}
                      <span className="chat-date">{formatTime(chat.created_at)}</span>
                    </div>
                  </button>
                  <button
                    title="Delete chat"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '0.5rem',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    <span
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        display: 'inline-block',
                        backgroundImage:
                          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%23f87171\"><path d=\"M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zm2.46-9.12a1 1 0 011.41 0l1.13 1.13 1.13-1.13a1 1 0 111.41 1.41l-1.13 1.13 1.13 1.13a1 1 0 01-1.41 1.41l-1.13-1.13-1.13 1.13a1 1 0 01-1.41-1.41l1.13-1.13-1.13-1.13a1 1 0 010-1.41z\"/><path d=\"M18 4V2H6v2H2v2h20V4h-4z\"/></svg>')",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    ></span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button onClick={handleSignOutClick} className="signout-btn">
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
              {botTyping && (
                <div className="message-wrapper bot">
                  <div className="message-content">
                    <div className="message-avatar"><div className="bot-icon"></div></div>
                    <div className="message-bubble">
                      <div className="message-text">typing...</div>
                    </div>
                  </div>
                </div>
              )}
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
                disabled={!selectedChat}
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={!newMessage.trim() || !selectedChat}
              >
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

      {/* Confirm Delete Popup */}
      {confirmDeleteId && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200, // <-- increased z-index
          }}
        >
          <div
            style={{
              background: '#18181b',
              color: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              minWidth: '300px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <h3 style={{marginBottom: '1rem'}}>Delete Conversation?</h3>
            <p style={{marginBottom: '1.5rem'}}>Are you sure you want to delete this chat? This action cannot be undone.</p>
            <button
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                marginRight: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={confirmDeleteChat}
            >Delete</button>
            <button
              style={{
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={cancelDeleteChat}
            >Cancel</button>
          </div>
        </div>
      )}
      {/* Confirm Sign Out Popup */}
      {confirmSignOut && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200, // <-- increased z-index
          }}
        >
          <div
            style={{
              background: '#18181b',
              color: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              minWidth: '300px',
              boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <h3 style={{marginBottom: '1rem'}}>Sign Out?</h3>
            <p style={{marginBottom: '1.5rem'}}>Are you sure you want to sign out?</p>
            <button
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                marginRight: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={confirmSignOutAction}
            >Sign Out</button>
            <button
              style={{
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={cancelSignOutAction}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;
