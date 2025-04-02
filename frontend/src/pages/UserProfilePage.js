// frontend/src/pages/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Image, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FaUser, FaComments, FaReply, FaThumbsUp, FaThumbsDown, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';

const UserProfilePage = () => {
    const { userId } = useParams();

    const [user, setUser] = useState(null);
    const [userContent, setUserContent] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile and content
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/search/user/${userId}/content`);
                setUser(response.data.user);
                setUserContent(response.data.content);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Failed to load user profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // Filter content based on active tab
    const filteredContent = () => {
        if (activeTab === 'all') {
            return userContent;
        } else if (activeTab === 'messages') {
            return userContent.filter(item => item.type === 'message');
        } else if (activeTab === 'replies') {
            return userContent.filter(item => item.type === 'reply');
        }
        return [];
    };

    // Get total upvotes and downvotes
    const getTotalVotes = () => {
        const upvotes = userContent.reduce((total, item) => total + (item.upvotes || 0), 0);
        const downvotes = userContent.reduce((total, item) => total + (item.downvotes || 0), 0);
        return { upvotes, downvotes };
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading profile...</span>
                </Spinner>
            </div>
        );
    }

    if (error || !user) {
        return (
            <Alert variant="danger" className="my-3">
                {error || 'User not found'}
            </Alert>
        );
    }

    const { upvotes, downvotes } = getTotalVotes();
    const totalVotes = upvotes + downvotes;
    const ratingPercentage = totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0;

    return (
        <Container>
            <Row>
                {/* User Profile Card */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Body className="text-center">
                            <Image
                                src={user.avatar_url || 'https://via.placeholder.com/150'}
                                roundedCircle
                                width={150}
                                height={150}
                                className="mb-3"
                            />
                            <Card.Title className="mb-0">{user.display_name}</Card.Title>
                            <Card.Subtitle className="mb-3 text-muted">@{user.username}</Card.Subtitle>

                            <div className="d-flex justify-content-center mb-3">
                                <Badge bg="primary" className="me-2 p-2">
                                    <FaComments className="me-1" />
                                    {userContent.filter(item => item.type === 'message').length} Messages
                                </Badge>
                                <Badge bg="info" className="p-2">
                                    <FaReply className="me-1" />
                                    {userContent.filter(item => item.type === 'reply').length} Replies
                                </Badge>
                            </div>

                            <div className="rating-info mb-3">
                                <div className="d-flex justify-content-center">
                                    <div className="me-3 text-success">
                                        <FaThumbsUp className="me-1" />
                                        {upvotes} Upvotes
                                    </div>
                                    <div className="text-danger">
                                        <FaThumbsDown className="me-1" />
                                        {downvotes} Downvotes
                                    </div>
                                </div>
                                <div className="mt-2">
                                    Rating: <strong>{ratingPercentage.toFixed(1)}%</strong>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* User Content */}
                <Col lg={8}>
                    <Card className="shadow-sm">
                        <Card.Header>
                            <Nav variant="tabs" className="card-header-tabs">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'all'}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        All Activity
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'messages'}
                                        onClick={() => setActiveTab('messages')}
                                    >
                                        Messages
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'replies'}
                                        onClick={() => setActiveTab('replies')}
                                    >
                                        Replies
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>
                        <Card.Body>
                            {filteredContent().length === 0 ? (
                                <Alert variant="info">
                                    No {activeTab === 'all' ? 'activity' : activeTab} to display.
                                </Alert>
                            ) : (
                                filteredContent().map(item => (
                                    <Card key={`${item.type}-${item.id}`} className="mb-3 border-light">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <Badge bg={item.type === 'message' ? 'primary' : 'info'}>
                                                        {item.type === 'message' ? 'Message' : 'Reply'}
                                                    </Badge>
                                                    <span className="ms-2 text-muted">
                                                        in <strong>{item.channel_name}</strong>
                                                    </span>
                                                </div>
                                                <small className="text-muted d-flex align-items-center">
                                                    <FaClock className="me-1" />
                                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                </small>
                                            </div>

                                            {item.type === 'reply' && item.message_content && (
                                                <Card.Subtitle className="mb-2 text-muted">
                                                    <small>
                                                        In response to: {item.message_content.length > 100
                                                            ? `${item.message_content.substring(0, 100)}...`
                                                            : item.message_content}
                                                    </small>
                                                </Card.Subtitle>
                                            )}

                                            <Card.Text>
                                                {item.content.length > 200
                                                    ? `${item.content.substring(0, 200)}...`
                                                    : item.content}
                                            </Card.Text>

                                            <div className="d-flex">
                                                <div className="me-3 text-success">
                                                    <FaThumbsUp className="me-1" />
                                                    {item.upvotes || 0}
                                                </div>
                                                <div className="text-danger">
                                                    <FaThumbsDown className="me-1" />
                                                    {item.downvotes || 0}
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfilePage;