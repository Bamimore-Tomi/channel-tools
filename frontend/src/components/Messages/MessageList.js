// frontend/src/components/Messages/MessageList.js
import React, { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import api from '../../utils/api';
import MessageCard from './MessageCard';

const MessageList = ({ channelId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch messages on component mount and when channelId changes
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/messages/channel/${channelId}`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setError('Failed to load messages. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [channelId]);

    // Remove a message from the list (after deletion)
    const handleMessageDeleted = (messageId) => {
        setMessages(messages.filter(message => message.id !== messageId));
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading messages...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-3">
                {error}
            </Alert>
        );
    }

    if (messages.length === 0) {
        return (
            <Alert variant="info" className="my-3">
                No messages in this channel yet. Be the first to post!
            </Alert>
        );
    }

    return (
        <div>
            {messages.map(message => (
                <MessageCard
                    key={message.id}
                    message={message}
                    onDelete={handleMessageDeleted}
                />
            ))}
        </div>
    );
};

export default MessageList;