import React, { useState, useEffect, useRef } from 'react';
import { useSignOut } from '@nhost/react';
import { gql, useSubscription, useMutation, useQuery } from '@apollo/client';
import '../App.css';
import '../styles/ChatbotPage.css';

// GraphQL subscription
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

// Query for chats with user_id placeholder to be replaced dynamically
const GET_CHATS = gql`
  query GetChats {
    chats(where: { user_id: { _eq: "X-Hasura-User-Id" } }) {
      id
      created_at
      title
    }
  }
`;

// Mutation to create new chat
const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
    }
  }
`;

// Mutation to insert user messages
const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chatId, content: $content, is_bot: false }) {
      id
      content
    }
  }
`;

// Mutation to call sendMessage action
const CHATBOT_ACTION = gql`
  mutation ChatbotAction($chatId: uuid!, $message: String!) {
    sendMessage(input: { chat_id: $chatId, message_content: $message }) {
      reply
    }
  }
`;

const ChatbotPage = () => {
  // const user = useUserData();
  const { signOut } = useSignOut(); // Destructure the signOut function from the returned object
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChatTitle, setNewChatTitle] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch chats
  const { data: chatsData, loading: chatsLoading } = useQuery(GET_CHATS);

  // Subscribe to messages for selected chat
  const { data: messagesData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId: selectedChat },
    skip: !selectedChat,
  });

  const [createChat] = useMutation(CREATE_CHAT, {
    refetchQueries: [{ query: GET_CHATS }],
  });

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [triggerChatbot] = useMutation(CHATBOT_ACTION);

  useEffect(() => {
    if (chatsData && chatsData.chats.length > 0 && !selectedChat) {
      setSelectedChat(chatsData.chats[0].id);
    }
  }, [chatsData, selectedChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;
    try {
      const { data } = await createChat();
      setNewChatTitle('');
      setSelectedChat(data.insert_chats_one.id);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await sendMessageMutation({
        variables: { chatId: selectedChat, content: newMessage },
      });
      await triggerChatbot({
        variables: { chatId: selectedChat, message: newMessage },
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Your Conversations</h2>
          <button onClick={() => signOut()} className="signout-btn">
            <span className="signout-icon"></span>
            Sign Out
          </button>
        </div>

        <form onSubmit={handleCreateChat} className="new-chat-form">
          <input
            type="text"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            placeholder="New conversation title"
            className="new-chat-input"
          />
          <button type="submit" className="new-chat-btn">
            <span className="plus-icon"></span>
          </button>
        </form>

        {chatsLoading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Loading conversations...</span>
          </div>
        ) : (
          <ul className="chats-list">
            {chatsData?.chats.map((chat) => (
              <li
                key={chat.id}
                className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="chat-icon"></div>
                <div className="chat-details">
                  <span className="chat-title">{chat.title || 'New Conversation'}</span>
                  <span className="chat-date">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="messages-container">
              {messagesData?.messages.map((message) => (
                <div key={message.id} className={`message-wrapper ${message.is_bot ? 'bot' : 'user'}`}>
                  <div className="message-bubble">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                <span className="send-icon"></span>
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat-state">
            <div className="empty-chat-graphic"></div>
            <h3>Start a New Conversation</h3>
            <p>Select an existing chat or create a new one to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;
