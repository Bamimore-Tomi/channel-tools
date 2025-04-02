// frontend/src/components/Replies/ReplyCard.js
import React, { useState, useContext } from 'react';
import { Card, Button, Image, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash, FaReply, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import api from '../../utils/api';
import { AuthContext } from '../Auth/AuthContext';
import Rating from '../UI/Rating';
import ReplyCreate from './ReplyCreate';
import ReplyList from './ReplyList';
import { getAvatarUrl } from '../../utils/helpers';


const ReplyCard = ({ reply, onDelete, onReplyCreated }) => {
    const { user, isAuthenticated, isAdmin } = useContext(AuthContext);
    const [showNestedReplies, setShowNestedReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    // Format the creation date
    const formattedDate = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true });

    // Check if logged in user is the reply creator
    const isCreator = user && reply.user_id === user.id;

    // Handle reply deletion
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await api.delete(`/api/replies/${reply.id}`);
            onDelete(reply.id);
            setConfirmDelete(false);
        } catch (error) {
            console.error('Error deleting reply:', error);
            setError('Failed to delete reply. Please try again.');
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
                    <div key={index} className="my-2">
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

                return <div key={index} className="mb-2">{textWithBreaks}</div>;
            }
        });
    };

    // Handle nested reply creation
    const handleNestedReplyCreated = (newReply) => {
        setShowReplyForm(false);
        setShowNestedReplies(true);
        if (onReplyCreated) {
            onReplyCreated(newReply);
        }
    };

    return (
        <div className="reply-card mb-3">
            <Card className="border-0">
                <Card.Body className="pt-2 pb-2">
                    <div className="d-flex">
                        <div className="me-2">
                            <Image
                                src={getAvatarUrl(user?.avatar_url)}
                                roundedCircle
                                width={30}
                                height={30}
                            />
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <Link to={`/users/${reply.user_id}`} className="text-decoration-none fw-bold">
                                        {reply.display_name}
                                    </Link>
                                    <small className="text-muted ms-2 d-inline-flex align-items-center">
                                        <FaClock size={12} className="me-1" />
                                        {formattedDate}
                                    </small>
                                </div>

                                {/* Delete button - visible only to admin or creator */}
                                {(isAdmin || isCreator) && (
                                    <Button
                                        variant="link"
                                        className="text-danger p-0 ms-2"
                                        onClick={() => setConfirmDelete(true)}
                                    >
                                        <FaTrash size={14} />
                                    </Button>
                                )}
                            </div>

                            {/* Reply content */}
                            <div className="mt-2 reply-content">
                                {renderContent(reply.content)}
                            </div>

                            {/* Screenshot/Image if exists */}
                            {reply.image_url && (
                                <div className="mt-2 mb-2">
                                    <a href={reply.image_url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={reply.image_url}
                                            alt="Screenshot"
                                            className="img-fluid border rounded"
                                            style={{ maxHeight: '150px' }}
                                        />
                                    </a>
                                </div>
                            )}

                            {/* Reply actions */}
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <Rating
                                    replyId={reply.id}
                                    upvotes={reply.upvotes}
                                    downvotes={reply.downvotes}
                                    isAuthenticated={isAuthenticated}
                                />

                                <div>
                                    {/* If there are child replies, show toggle button */}
                                    {reply.child_count > 0 && (
                                        <Button
                                            variant="link"
                                            className="text-secondary p-0 me-3"
                                            onClick={() => setShowNestedReplies(!showNestedReplies)}
                                        >
                                            <small>
                                                {showNestedReplies ? (
                                                    <>
                                                        <FaChevronUp className="me-1" />
                                                        Hide Replies ({reply.child_count})
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaChevronDown className="me-1" />
                                                        Show Replies ({reply.child_count})
                                                    </>
                                                )}
                                            </small>
                                        </Button>
                                    )}

                                    {/* Reply button */}
                                    {isAuthenticated && (
                                        <Button
                                            variant="link"
                                            className="text-secondary p-0"
                                            onClick={() => setShowReplyForm(!showReplyForm)}
                                        >
                                            <small>
                                                <FaReply className="me-1" />
                                                Reply
                                            </small>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Nested reply form */}
                            {showReplyForm && (
                                <div className="mt-3">
                                    <ReplyCreate
                                        parentReplyId={reply.id}
                                        onReplyCreated={handleNestedReplyCreated}
                                        onCancel={() => setShowReplyForm(false)}
                                    />
                                </div>
                            )}

                            {/* Nested replies */}
                            {showNestedReplies && reply.child_count > 0 && (
                                <ReplyList parentReplyId={reply.id} />
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Delete Reply</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <p>Are you sure you want to delete this reply?</p>
                    {reply.child_count > 0 && (
                        <p className="text-danger">This will also delete all responses to this reply.</p>
                    )}
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
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReplyCard;