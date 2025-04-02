// frontend/src/components/Replies/ReplyCreate.js
import React, { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaPaperclip, FaCode, FaPaperPlane, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';

const ReplyCreate = ({ messageId, parentReplyId, onReplyCreated, onCancel }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input
        if (!content.trim()) {
            setError('Please enter reply content');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            // Determine which endpoint to use based on whether this is a reply to a message or another reply
            const endpoint = messageId
                ? `/api/replies/message/${messageId}`
                : `/api/replies/parent/${parentReplyId}`;

            // Send request
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form
            setContent('');
            setImage(null);
            setImagePreview(null);

            // Notify parent component
            onReplyCreated(response.data.reply);

        } catch (error) {
            console.error('Error creating reply:', error);
            setError(error.response?.data?.message || 'Failed to create reply. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            // Check file type
            if (!selectedFile.type.match('image.*')) {
                setError('Please select an image file');
                return;
            }

            // Check file size (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setImage(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);

            setError('');
        }
    };

    // Insert code block in reply
    const insertCodeBlock = () => {
        const codeBlock = "```\n// Your code here\n```";
        const cursorPosition = content.length;
        const newContent = content.substring(0, cursorPosition) + codeBlock;
        setContent(newContent);
    };

    return (
        <div className="reply-form">
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your reply..."
                        required
                    />
                </Form.Group>

                {/* Image preview */}
                {imagePreview && (
                    <div className="mb-2">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid border rounded"
                            style={{ maxHeight: '100px' }}
                        />
                        <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0 ms-2"
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                            }}
                        >
                            <FaTimes /> Remove
                        </Button>
                    </div>
                )}

                <div className="d-flex justify-content-between">
                    <div>
                        {/* Image upload */}
                        <InputGroup className="w-auto">
                            <Form.Label htmlFor="reply-image-upload" className="mb-0">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    as="span"
                                    disabled={loading}
                                >
                                    <FaPaperclip className="me-1" />
                                    Image
                                </Button>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                id="reply-image-upload"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="d-none"
                            />

                            {/* Code block button */}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={insertCodeBlock}
                                disabled={loading}
                            >
                                <FaCode className="me-1" />
                                Code
                            </Button>
                        </InputGroup>
                    </div>

                    <div>
                        {/* Cancel button */}
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={onCancel}
                            className="me-2"
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        {/* Submit button */}
                        <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            disabled={loading}
                        >
                            <FaPaperPlane className="me-1" />
                            {loading ? 'Posting...' : 'Post Reply'}
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
};

export default ReplyCreate;