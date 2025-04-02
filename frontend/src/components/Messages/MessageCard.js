// frontend/src/components/Messages/MessageCard.js
import React, { useState, useContext } from 'react';
import { Card, Button, Badge, Image, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash, FaReply, FaClock, FaUser } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import api from '../../utils/api';
import { AuthContext } from '../Auth/AuthContext';
import Rating from '../UI/Rating';
import ReplyCreate from '../Replies/ReplyCreate';
import ReplyList from '../Replies/ReplyList';

const MessageCard = ({ message, onDelete }) => {
    const { user, isAuthenticated, isAdmin } = useContext(AuthContext);
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    // Format the creation date
    const formattedDate = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

    // Check if logged in user is the message creator
    const isCreator = user && message.user_id === user.id;

    // Handle message deletion
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await api.delete(`/api/messages/${message.id}`);
            onDelete(message.id);
            setConfirmDelete(false);
        } catch (error) {
            console.error('Error deleting message:', error);
            setError('Failed to delete message. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper function to detect and highlight code blocks
    const renderContent = (content) => {
        // Simple regex to detect code blocks enclosed in triple backticks with optional language
        const codeBlockRegex = /```([a-zA-Z]*)?\n([\s\S]*?)```/g;

        // Split content into code and non-code parts
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.substring(lastIndex, match.index)
                });
            }

            // Add code block
            parts.push({
                type: 'code',
                language: match[1] || 'javascript',
                content: match[2].trim()
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last code block
        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex)
            });
        }

        // If no code blocks were found, just return the content as text
        if (parts.length === 0) {
            parts.push({
                type: 'text',
                content: content
            });
        }

        // Render each part
        return parts.map((part, index) => {
            if (part.type === 'code') {
                return (
                    <div key={index} className="my-3">
                        <SyntaxHighlighter language={part.language} style={docco}>
                            {part.content}
                        </SyntaxHighlighter>
                    </div>
                );
            } else {
                // Convert line breaks to <br> elements for text parts
                const textWithBreaks = part.content
                    .split('\n')
                    .map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i !== part.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                    ));

                return <div key={index} className="mb-3">{textWithBreaks}</div>;
            }
        });
    };

    // Handle reply creation
    const handleReplyCreated = () => {
        setShowReplyForm(false);
        setShowReplies(true);
    };

    return (
        <>
            <Card className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <div className="d-flex align-items-center">
                        <Image
                            src={message.avatar_url || 'https://via.placeholder.com/40'}
                            roundedCircle
                            width={40}
                            height={40}
                            className="me-2"
                        />
                        <div>
                            <Link to={`/users/${message.user_id}`} className="text-decoration-none fw-bold">
                                {message.display_name}
                            </Link>
                            <div className="text-muted small d-flex align-items-center">
                                <FaClock className="me-1" size={12} />
                                {formattedDate}
                            </div>
                        </div>
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
                </Card.Header>

                <Card.Body>
                    {/* Message content */}
                    <div className="mb-3">
                        {renderContent(message.content)}
                    </div>

                    {/* Screenshot/Image if exists */}
                    {message.image_url && (
                        <div className="text-center mb-3">
                            <a href={message.image_url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={message.image_url}
                                    alt="Screenshot"
                                    className="img-fluid border rounded"
                                    style={{ maxHeight: '300px' }}
                                />
                            </a>
                        </div>
                    )}

                    {/* Rating component */}
                    <div className="d-flex justify-content-between align-items-center">
                        <Rating
                            messageId={message.id}
                            upvotes={message.upvotes}
                            downvotes={message.downvotes}
                            isAuthenticated={isAuthenticated}
                        />

                        <div>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => setShowReplies(!showReplies)}
                            >
                                <Badge bg="secondary" className="me-1">
                                    {message.reply_count || 0}
                                </Badge>
                                {showReplies ? 'Hide Replies' : 'Show Replies'}
                            </Button>

                            {isAuthenticated && (
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => setShowReplyForm(!showReplyForm)}
                                >
                                    <FaReply className="me-1" />
                                    Reply
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Body>

                {/* Reply form */}
                {showReplyForm && (
                    <Card.Footer className="bg-white">
                        <ReplyCreate
                            messageId={message.id}
                            onReplyCreated={handleReplyCreated}
                            onCancel={() => setShowReplyForm(false)}
                        />
                    </Card.Footer>
                )}

                {/* Replies section */}
                {showReplies && (
                    <Card.Footer className="bg-white">
                        <ReplyList messageId={message.id} />
                    </Card.Footer>
                )}
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <p>Are you sure you want to delete this message? This will also delete all replies.</p>
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
                        {isDeleting ? 'Deleting...' : 'Delete Message'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MessageCard;