// frontend/src/components/Channels/ChannelCard.js
import React, { useContext, useState } from 'react';
import { Card, Button, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash, FaComments, FaUser, FaClock } from 'react-icons/fa';
import api from '../../utils/api';
import { AuthContext } from '../Auth/AuthContext';

const ChannelCard = ({ channel, onDelete }) => {
    const { user, isAdmin } = useContext(AuthContext);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Format the creation date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'today';
        } else if (diffDays === 1) {
            return 'yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} ${years === 1 ? 'year' : 'years'} ago`;
        }
    };

    const formattedDate = formatDate(channel.created_at);

    // Check if the logged in user is the channel creator
    const isCreator = user && channel.created_by === user.id;

    // Delete the channel
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await api.delete(`/api/channels/${channel.id}`);
            onDelete(channel.id);
            setConfirmDelete(false);
        } catch (error) {
            console.error('Error deleting channel:', error);
            alert('Failed to delete channel. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card className="h-100 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <Card.Title>
                                <Link to={`/channels/${channel.id}`} className="text-decoration-none">
                                    {channel.name}
                                </Link>
                            </Card.Title>

                            <Card.Subtitle className="mb-2 text-muted">
                                <FaUser className="me-1" size={14} />
                                {channel.creator_name}
                            </Card.Subtitle>
                        </div>

                        {/* Delete button - visible only to admin or creator */}
                        {(isAdmin || isCreator) && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setConfirmDelete(true)}
                            >
                                <FaTrash />
                            </Button>
                        )}
                    </div>

                    <Card.Text className="my-3">
                        {channel.description}
                    </Card.Text>

                    <div className="d-flex justify-content-between align-items-center">
                        <Badge bg="info" className="d-flex align-items-center">
                            <FaComments className="me-1" />
                            {channel.message_count || 0} messages
                        </Badge>

                        <small className="text-muted d-flex align-items-center">
                            <FaClock className="me-1" />
                            Created {formattedDate}
                        </small>
                    </div>
                </Card.Body>

                <Card.Footer className="bg-white">
                    <Link to={`/channels/${channel.id}`} className="w-100">
                        <Button variant="primary" className="w-100">View Channel</Button>
                    </Link>
                </Card.Footer>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the channel "{channel.name}"?
                    This will permanently delete all messages and replies in the channel.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Channel'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ChannelCard;