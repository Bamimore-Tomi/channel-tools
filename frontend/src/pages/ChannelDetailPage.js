// frontend/src/pages/ChannelDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import api from '../utils/api';
import { AuthContext } from '../components/Auth/AuthContext';
import MessageCard from '../components/Messages/MessageCard';
import MessageCreate from '../components/Messages/MessageCreate';

const ChannelDetailPage = () => {
    const { channelId } = useParams();
    const { isAuthenticated } = useContext(AuthContext);

    const [channel, setChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMessageForm, setShowMessageForm] = useState(false);

    // Fetch channel details and messages
    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                setLoading(true);

                // Fetch channel details
                const channelResponse = await api.get(`/api/channels/${channelId}`);
                setChannel(channelResponse.data.channel);

                // Fetch messages for this channel
                await fetchMessages();
            } catch (error) {
                console.error('Error fetching channel data:', error);
                setError('Failed to load channel. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChannelData();
    }, [channelId]);

    // Function to fetch messages (can be called after posting a new message)
    const fetchMessages = async () => {
        try {
            const messagesResponse = await api.get(`/api/messages/channel/${channelId}`);
            setMessages(messagesResponse.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages. Please try again.');
        }
    };

    // Handle new message creation
    const handleMessageCreated = async () => {
        // Hide the message form
        setShowMessageForm(false);

        // Fetch the updated list of messages to include the new one
        await fetchMessages();
    };

    // Handle message deletion
    const handleMessageDeleted = (messageId) => {
        // Remove the deleted message from state
        setMessages(messages.filter(message => message.id !== messageId));
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading channel...</span>
                </Spinner>
            </div>
        );
    }

    if (error || !channel) {
        return (
            <Container>
                <Alert variant="danger" className="my-3">
                    {error || 'Channel not found'}
                </Alert>
                <Link to="/channels" className="btn btn-primary">
                    <FaArrowLeft className="me-1" /> Back to Channels
                </Link>
            </Container>
        );
    }

    return (
        <Container>
            {/* Channel Header */}
            <div className="mb-4">
                <Link to="/channels" className="btn btn-outline-secondary mb-3">
                    <FaArrowLeft className="me-1" /> Back to Channels
                </Link>

                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1>{channel.name}</h1>
                        <p className="text-muted mb-0">
                            Created by {channel.creator_name}
                        </p>
                    </div>

                    {isAuthenticated && (
                        <Button
                            variant="primary"
                            onClick={() => setShowMessageForm(!showMessageForm)}
                        >
                            {showMessageForm ? 'Cancel' : 'Ask a Question'}
                        </Button>
                    )}
                </div>

                <p className="lead mt-3">{channel.description}</p>
            </div>

            {/* New Message Form */}
            {showMessageForm && (
                <div className="mb-4">
                    <MessageCreate
                        channelId={channelId}
                        onMessageCreated={handleMessageCreated}
                    />
                </div>
            )}

            {/* Messages List */}
            {messages.length === 0 ? (
                <Alert variant="info">
                    No messages in this channel yet. Be the first to post a question!
                </Alert>
            ) : (
                <div>
                    {messages.map(message => (
                        <MessageCard
                            key={message.id}
                            message={message}
                            onDelete={handleMessageDeleted}
                        />
                    ))}
                </div>
            )}
        </Container>
    );
};

export default ChannelDetailPage;