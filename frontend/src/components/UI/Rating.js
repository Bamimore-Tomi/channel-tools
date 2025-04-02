// frontend/src/components/UI/Rating.js
import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import api from '../../utils/api';

const Rating = ({ messageId, replyId, upvotes, downvotes, isAuthenticated }) => {
    const [votes, setVotes] = useState({ up: upvotes || 0, down: downvotes || 0 });
    const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
    const [isVoting, setIsVoting] = useState(false);

    // Handle vote action
    const handleVote = async (isUpvote) => {
        if (!isAuthenticated) return;
        if (isVoting) return;

        try {
            setIsVoting(true);

            // Determine if voting on a message or reply
            const endpoint = messageId
                ? `/api/messages/${messageId}/rate`
                : `/api/replies/${replyId}/rate`;

            // Send the vote
            const response = await api.post(endpoint, {
                is_upvote: isUpvote
            });

            // Update local state
            setVotes({
                up: response.data.upvotes,
                down: response.data.downvotes
            });

            // Update user's vote indicator
            setUserVote(isUpvote ? 'up' : 'down');

        } catch (error) {
            console.error('Error rating content:', error);
        } finally {
            setIsVoting(false);
        }
    };

    // Login prompt tooltip
    const loginTooltip = (props) => (
        <Tooltip id="login-tooltip" {...props}>
            Login to rate this content
        </Tooltip>
    );

    return (
        <div className="rating-buttons d-flex align-items-center">
            {/* Upvote Button */}
            {isAuthenticated ? (
                <Button
                    variant="link"
                    className={`p-0 me-2 ${userVote === 'up' ? 'rated-up' : 'text-secondary'}`}
                    onClick={() => handleVote(true)}
                    disabled={isVoting}
                >
                    <FaThumbsUp />
                </Button>
            ) : (
                <OverlayTrigger placement="top" overlay={loginTooltip}>
                    <span className="text-secondary me-2">
                        <FaThumbsUp />
                    </span>
                </OverlayTrigger>
            )}

            <span className="me-3">{votes.up}</span>

            {/* Downvote Button */}
            {isAuthenticated ? (
                <Button
                    variant="link"
                    className={`p-0 me-2 ${userVote === 'down' ? 'rated-down' : 'text-secondary'}`}
                    onClick={() => handleVote(false)}
                    disabled={isVoting}
                >
                    <FaThumbsDown />
                </Button>
            ) : (
                <OverlayTrigger placement="top" overlay={loginTooltip}>
                    <span className="text-secondary me-2">
                        <FaThumbsDown />
                    </span>
                </OverlayTrigger>
            )}

            <span>{votes.down}</span>
        </div>
    );
};

export default Rating;