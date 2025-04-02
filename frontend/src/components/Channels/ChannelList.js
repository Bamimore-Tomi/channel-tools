// frontend/src/components/Channels/ChannelList.js
import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaComments, FaPlus } from 'react-icons/fa';
import api from '../../utils/api';
import { AuthContext } from '../Auth/AuthContext';
import ChannelCard from './ChannelCard';
import ChannelCreate from './ChannelCreate';

const ChannelList = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { isAuthenticated } = useContext(AuthContext);

    // Fetch channels on component mount
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/channels');
                setChannels(response.data.channels);
            } catch (error) {
                console.error('Error fetching channels:', error);
                setError('Failed to load channels. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, []);

    // Add new channel to the list
    const handleChannelCreated = (newChannel) => {
        setChannels([newChannel, ...channels]);
    };

    // Remove channel from the list
    const handleChannelDeleted = (channelId) => {
        setChannels(channels.filter(channel => channel.id !== channelId));
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading channels...</span>
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

    return (
        <div>
            {/* Create Channel Button */}
            {isAuthenticated && (
                <div className="mb-4 text-end">
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FaPlus className="me-1" /> Create Channel
                    </Button>
                </div>
            )}

            {/* No channels message */}
            {channels.length === 0 && (
                <Card className="text-center p-5 mb-4">
                    <div className="mb-3">
                        <FaComments size={50} className="text-muted" />
                    </div>
                    <Card.Title>No Channels Yet</Card.Title>
                    <Card.Text>
                        {isAuthenticated
                            ? "Be the first to create a channel!"
                            : "There are no channels yet. Sign in to create the first one!"}
                    </Card.Text>
                    {!isAuthenticated && (
                        <div className="mt-3">
                            <Link to="/auth">
                                <Button variant="primary">Sign In</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            )}

            {/* Channel List */}
            <Row className="g-4">
                {channels.map(channel => (
                    <Col key={channel.id} md={6} lg={4}>
                        <ChannelCard
                            channel={channel}
                            onDelete={handleChannelDeleted}
                        />
                    </Col>
                ))}
            </Row>

            {/* Create Channel Modal */}
            <ChannelCreate
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onChannelCreated={handleChannelCreated}
            />
        </div>
    );
};

export default ChannelList;