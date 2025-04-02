// frontend/src/pages/ChannelDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import api from '../utils/api';
import { AuthContext } from '../components/Auth/AuthContext';
import MessageList from '../components/Messages/MessageList';
import MessageCreate from '../components/Messages/MessageCreate';

const ChannelDetailPage = () => {
    const { channelId } = useParams();
    const { isAuthenticated } = useContext(AuthContext);

    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMessageForm, setShowMessageForm] = useState(false);

    // Fetch channel details
    useEffect(() => {
        const fetchChannel = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/channels/${channelId}`);
                setChannel(response.data.channel);
            } catch (error) {
                console.error('Error fetching channel:', error);
                setError('Failed to load channel. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChannel();
    }, [channelId]);

    // Handle new message creation
    const handleMessageCreated = () => {
        setShowMessageForm(false);
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
            <Alert variant="danger" className="my-3">
                {error || 'Channel not found'}
            </Alert>
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

            {/* Message List */}
            <MessageList channelId={channelId} />
        </Container>
    );
};

export default ChannelDetailPage;