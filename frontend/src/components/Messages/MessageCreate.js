// frontend/src/components/Messages/MessageCreate.js
import React, { useState } from 'react';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { FaPaperclip, FaCode, FaPaperPlane } from 'react-icons/fa';
import api from '../../utils/api';

const MessageCreate = ({ channelId, onMessageCreated }) => {
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
            setError('Please enter message content');
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

            // Send request
            await api.post(`/api/messages/channel/${channelId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form
            setContent('');
            setImage(null);
            setImagePreview(null);

            // Notify parent component
            onMessageCreated();

        } catch (error) {
            console.error('Error creating message:', error);
            setError(error.response?.data?.message || 'Failed to create message. Please try again.');
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

    // Insert code block in message
    const insertCodeBlock = () => {
        const codeBlock = "```\n// Your code here\n```";
        const cursorPosition = content.length;
        const newContent = content.substring(0, cursorPosition) + codeBlock;
        setContent(newContent);
    };

    return (
        <Card className="shadow-sm">
            <Card.Header>
                <h5 className="mb-0">Ask a Question</h5>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="messageContent">
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your question here... Use triple backticks (```) for code blocks"
                            required
                        />
                    </Form.Group>

                    {/* Image preview */}
                    {imagePreview && (
                        <div className="mb-3 text-center">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="img-fluid border rounded"
                                style={{ maxHeight: '200px' }}
                            />
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="d-block mx-auto mt-2"
                                onClick={() => {
                                    setImage(null);
                                    setImagePreview(null);
                                }}
                            >
                                Remove Image
                            </Button>
                        </div>
                    )}

                    <div className="d-flex justify-content-between">
                        <div>
                            {/* Image upload */}
                            <InputGroup className="w-auto">
                                <Form.Label htmlFor="image-upload" className="mb-0">
                                    <Button
                                        variant="outline-secondary"
                                        as="span"
                                        disabled={loading}
                                    >
                                        <FaPaperclip className="me-1" />
                                        Attach Screenshot
                                    </Button>
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    id="image-upload"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="d-none"
                                />

                                {/* Code block button */}
                                <Button
                                    variant="outline-secondary"
                                    onClick={insertCodeBlock}
                                    disabled={loading}
                                >
                                    <FaCode className="me-1" />
                                    Insert Code Block
                                </Button>
                            </InputGroup>
                        </div>

                        {/* Submit button */}
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                        >
                            <FaPaperPlane className="me-1" />
                            {loading ? 'Posting...' : 'Post Question'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default MessageCreate;