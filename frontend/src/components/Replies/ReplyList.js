// frontend/src/components/Replies/ReplyList.js
import React, { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import api from '../../utils/api';
import ReplyCard from './ReplyCard';

const ReplyList = ({ messageId, parentReplyId }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch replies on component mount
    useEffect(() => {
        const fetchReplies = async () => {
            try {
                setLoading(true);

                // Determine which endpoint to use based on whether this is for a message or a nested reply
                const endpoint = parentReplyId
                    ? `/api/replies/parent/${parentReplyId}`
                    : `/api/replies/message/${messageId}`;

                const response = await api.get(endpoint);
                setReplies(response.data.replies);
            } catch (error) {
                console.error('Error fetching replies:', error);
                setError('Failed to load replies. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchReplies();
    }, [messageId, parentReplyId]);

    // Add new reply to the list
    const handleReplyCreated = (newReply) => {
        setReplies([...replies, newReply]);
    };

    // Remove a reply from the list (after deletion)
    const handleReplyDeleted = (replyId) => {
        setReplies(replies.filter(reply => reply.id !== replyId));
    };

    if (loading) {
        return (
            <div className="text-center my-3">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading replies...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-2">
                {error}
            </Alert>
        );
    }

    if (replies.length === 0) {
        return (
            <div className="text-muted text-center my-3">
                No replies yet.
            </div>
        );
    }

    return (
        <div className={parentReplyId ? 'nested-reply mt-3' : 'mt-3'}>
            {replies.map(reply => (
                <ReplyCard
                    key={reply.id}
                    reply={reply}
                    onDelete={handleReplyDeleted}
                    onReplyCreated={handleReplyCreated}
                />
            ))}
        </div>
    );
};

export default ReplyList;