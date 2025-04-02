// frontend/src/pages/SearchPage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, InputGroup, Button, Tabs, Tab, Spinner, Alert, Card } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaComments, FaReply, FaUser } from 'react-icons/fa';
import api from '../utils/api';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState('all');
    const [searchResults, setSearchResults] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [highestRatedUsers, setHighestRatedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Perform search when query from URL changes
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, [initialQuery]);

    // Also fetch top users data
    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                const [mostPostsResponse, highestRatedResponse] = await Promise.all([
                    api.get('/api/search/stats/users/most-posts'),
                    api.get('/api/search/stats/users/highest-rated')
                ]);

                setTopUsers(mostPostsResponse.data.users);
                setHighestRatedUsers(highestRatedResponse.data.users);
            } catch (error) {
                console.error('Error fetching top users:', error);
            }
        };

        fetchTopUsers();
    }, []);

    // Handle search form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
            performSearch(query.trim());
        }
    };

    // Perform the search
    const performSearch = async (searchQuery) => {
        try {
            setLoading(true);
            setError(null);

            const [contentResponse, usersResponse] = await Promise.all([
                api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`),
                api.get(`/api/search/users?q=${encodeURIComponent(searchQuery)}`)
            ]);

            setSearchResults(contentResponse.data.results);
            setUserResults(usersResponse.data.users);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render search result item
    const renderResultItem = (item) => {
        if (item.type === 'message') {
            return (
                <Card key={`message-${item.id}`} className="mb-3">
                    <Card.Body>
                        <Card.Title>
                            <FaComments className="me-2 text-primary" />
                            <Link to={`/channels/${item.channel_id}`}>
                                {item.channel_name}
                            </Link>
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                            Posted by <Link to={`/users/${item.user_id}`}>{item.display_name}</Link>
                        </Card.Subtitle>
                        <Card.Text>
                            {item.content.length > 200
                                ? `${item.content.substring(0, 200)}...`
                                : item.content}
                        </Card.Text>
                        <Link to={`/channels/${item.channel_id}`} className="btn btn-sm btn-outline-primary">
                            View Discussion
                        </Link>
                    </Card.Body>
                </Card>
            );
        } else if (item.type === 'reply') {
            return (
                <Card key={`reply-${item.id}`} className="mb-3">
                    <Card.Body>
                        <Card.Title>
                            <FaReply className="me-2 text-success" />
                            Reply in <Link to={`/channels/${item.channel_id}`}>{item.channel_name}</Link>
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                            Posted by <Link to={`/users/${item.user_id}`}>{item.display_name}</Link>
                        </Card.Subtitle>
                        <Card.Text className="mb-3">
                            <small className="text-muted">In response to: {item.message_content.length > 100
                                ? `${item.message_content.substring(0, 100)}...`
                                : item.message_content}
                            </small>
                        </Card.Text>
                        <Card.Text>
                            {item.content.length > 200
                                ? `${item.content.substring(0, 200)}...`
                                : item.content}
                        </Card.Text>
                        <Link to={`/channels/${item.channel_id}`} className="btn btn-sm btn-outline-primary">
                            View Discussion
                        </Link>
                    </Card.Body>
                </Card>
            );
        }
        return null;
    };

    // Render user result item
    const renderUserItem = (user) => (
        <Card key={`user-${user.id}`} className="mb-3">
            <Card.Body className="d-flex align-items-center">
                <div className="me-3">
                    <img
                        src={user.avatar_url || 'https://via.placeholder.com/80'}
                        alt={user.display_name}
                        className="rounded-circle"
                        width="80"
                        height="80"
                    />
                </div>
                <div>
                    <Card.Title>
                        <FaUser className="me-2 text-info" />
                        <Link to={`/users/${user.id}`}>{user.display_name}</Link>
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                        @{user.username}
                    </Card.Subtitle>
                    <Link to={`/users/${user.id}`} className="btn btn-sm btn-outline-info">
                        View Profile
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );

    // Render top user item with stats
    const renderTopUserItem = (user, index, showRating = false) => (
        <Card key={`top-user-${user.id}`} className="mb-3">
            <Card.Body className="d-flex align-items-center">
                <div className="me-3 text-center">
                    <div className="h3 mb-0 text-primary">{index + 1}</div>
                </div>
                <div className="me-3">
                    <img
                        src={user.avatar_url || 'https://via.placeholder.com/60'}
                        alt={user.display_name}
                        className="rounded-circle"
                        width="60"
                        height="60"
                    />
                </div>
                <div className="flex-grow-1">
                    <Card.Title className="mb-1">
                        <Link to={`/users/${user.id}`}>{user.display_name}</Link>
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                        @{user.username}
                    </Card.Subtitle>
                </div>
                <div className="text-end">
                    {showRating ? (
                        <div>
                            <div className="text-success mb-1">
                                <strong>{user.upvotes}</strong> upvotes
                            </div>
                            <div className="text-danger mb-1">
                                <strong>{user.downvotes}</strong> downvotes
                            </div>
                            <div className="text-primary">
                                Rating: <strong>{user.rating_percentage.toFixed(1)}%</strong>
                            </div>
                        </div>
                    ) : (
                        <div className="text-primary">
                            <strong>{user.post_count}</strong> posts
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container>
            <h1 className="mb-4">Search</h1>

            {/* Search Form */}
            <Form onSubmit={handleSubmit} className="mb-4">
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Search for messages, replies, or users"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                        <FaSearch className="me-1" /> Search
                    </Button>
                </InputGroup>
            </Form>

            {/* Search Results or Top Users */}
            {initialQuery ? (
                <>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Searching...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="mb-4"
                        >
                            <Tab eventKey="all" title="All Results">
                                {searchResults.length === 0 && userResults.length === 0 ? (
                                    <Alert variant="info">
                                        No results found for "{initialQuery}".
                                    </Alert>
                                ) : (
                                    <>
                                        {searchResults.map(item => renderResultItem(item))}
                                    </>
                                )}
                            </Tab>

                            <Tab eventKey="users" title="Users">
                                {userResults.length === 0 ? (
                                    <Alert variant="info">
                                        No user results found for "{initialQuery}".
                                    </Alert>
                                ) : (
                                    <>
                                        {userResults.map(user => renderUserItem(user))}
                                    </>
                                )}
                            </Tab>
                        </Tabs>
                    )}
                </>
            ) : (
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-4"
                >
                    <Tab eventKey="all" title="Top Statistics">
                        <h3 className="mb-3">User Rankings</h3>
                        <p className="text-muted mb-4">
                            See who's most active or highly rated in our community.
                        </p>
                    </Tab>

                    <Tab eventKey="most-posts" title="Most Active Users">
                        <h3 className="mb-3">Most Active Users</h3>
                        {topUsers.length === 0 ? (
                            <Alert variant="info">No data available yet.</Alert>
                        ) : (
                            <>
                                {topUsers.map((user, index) =>
                                    renderTopUserItem(user, index)
                                )}
                            </>
                        )}
                    </Tab>

                    <Tab eventKey="highest-rated" title="Highest Rated Users">
                        <h3 className="mb-3">Highest Rated Users</h3>
                        {highestRatedUsers.length === 0 ? (
                            <Alert variant="info">No rating data available yet.</Alert>
                        ) : (
                            <>
                                {highestRatedUsers.map((user, index) =>
                                    renderTopUserItem(user, index, true)
                                )}
                            </>
                        )}
                    </Tab>
                </Tabs>
            )}
        </Container>
    );
};

export default SearchPage;