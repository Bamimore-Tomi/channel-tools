// frontend/src/components/Channels/ChannelCreate.js
import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import api from '../../utils/api';

const ChannelCreate = ({ show, onHide, onChannelCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { name, description } = formData;

    // Handle form field changes
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Reset form when modal closes
    const handleClose = () => {
        setFormData({ name: '', description: '' });
        setError('');
        onHide();
    };

    // Handle form submission
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate input
        if (!name.trim() || !description.trim()) {
            setError('All fields are required');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/api/channels', formData);
            onChannelCreated(response.data.channel);
            handleClose();
        } catch (error) {
            console.error('Error creating channel:', error);
            setError(error.response?.data?.message || 'Failed to create channel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New Channel</Modal.Title>
            </Modal.Header>

            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3" controlId="channelName">
                        <Form.Label>Channel Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="Enter channel name"
                            required
                        />
                        <Form.Text className="text-muted">
                            Choose a descriptive name for your channel.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="channelDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            value={description}
                            onChange={onChange}
                            placeholder="Describe what this channel is about"
                            required
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Channel'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ChannelCreate;