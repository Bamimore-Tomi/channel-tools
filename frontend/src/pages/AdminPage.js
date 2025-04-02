// frontend/src/pages/AdminPage.js
import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { FaUsers, FaComments, FaReply, FaChartBar, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../components/Auth/AuthContext';
import api from '../utils/api';

const AdminPage = () => {
    const { user, isAdmin } = useContext(AuthContext);

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Delete user modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch admin dashboard data
    useEffect(() => {
        // Only fetch data if user is admin
        if (user && isAdmin) {
            const fetchAdminData = async () => {
                try {
                    setLoading(true);

                    const [statsResponse, usersResponse] = await Promise.all([
                        api.get('/api/admin/stats'),
                        api.get('/api/admin/users')
                    ]);

                    setStats(statsResponse.data.stats);
                    setRecentActivity(statsResponse.data.recentActivity);
                    setUsers(usersResponse.data.users);
                } catch (error) {
                    console.error('Error fetching admin data:', error);
                    setError('Failed to load admin dashboard data. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            fetchAdminData();
        } else {
            // If not admin, just set loading to false
            setLoading(false);
        }
    }, [user, isAdmin]);

    // Redirect if not admin
    if (!loading && (!user || !isAdmin)) {
        return <Navigate to="/" replace />;
    }

    // Delete user handler
    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setDeleting(true);
            await api.delete(`/api/admin/users/${userToDelete.id}`);

            // Remove user from the list
            setUsers(users.filter(u => u.id !== userToDelete.id));

            // Close modal
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    // Open delete confirmation modal
    const confirmDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading admin dashboard...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="my-3">
                {error}
            </Alert>
        );
    }

    return (
        <Container>
            <h1 className="mb-4">Admin Dashboard</h1>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <div className="display-4 mb-2 text-primary">{stats.users}</div>
                            <FaUsers size={30} className="text-primary mb-2" />
                            <Card.Title>Users</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <div className="display-4 mb-2 text-success">{stats.channels}</div>
                            <FaChartBar size={30} className="text-success mb-2" />
                            <Card.Title>Channels</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <div className="display-4 mb-2 text-info">{stats.messages}</div>
                            <FaComments size={30} className="text-info mb-2" />
                            <Card.Title>Messages</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center h-100 shadow-sm">
                        <Card.Body>
                            <div className="display-4 mb-2 text-warning">{stats.replies}</div>
                            <FaReply size={30} className="text-warning mb-2" />
                            <Card.Title>Replies</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Admin Tabs */}
            <Tabs defaultActiveKey="users" className="mb-4">
                <Tab eventKey="users" title="User Management">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h3 className="mb-3">All Users</h3>

                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Display Name</th>
                                            <th>Role</th>
                                            <th>Posts</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.username}</td>
                                                <td>{user.display_name}</td>
                                                <td>
                                                    <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {user.message_count + user.reply_count}
                                                    <small className="text-muted ms-1">
                                                        ({user.message_count} / {user.reply_count})
                                                    </small>
                                                </td>
                                                <td>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    {user.role !== 'admin' && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => confirmDeleteUser(user)}
                                                        >
                                                            <FaTrash /> Delete
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="activity" title="Recent Activity">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h3 className="mb-3">Recent Activity</h3>

                            {recentActivity.length === 0 ? (
                                <Alert variant="info">No recent activity to display.</Alert>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Content</th>
                                                <th>User</th>
                                                <th>Channel</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentActivity.map((activity, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <Badge bg={activity.type === 'message' ? 'primary' : 'info'}>
                                                            {activity.type}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {activity.content.length > 50
                                                            ? `${activity.content.substring(0, 50)}...`
                                                            : activity.content}
                                                    </td>
                                                    <td>{activity.display_name}</td>
                                                    <td>{activity.channel_name}</td>
                                                    <td>
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* Delete User Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <p>
                        Are you sure you want to delete user <strong>{userToDelete?.display_name}</strong> (@{userToDelete?.username})?
                    </p>
                    <p className="text-danger">
                        <strong>Warning:</strong> This action will permanently delete all content created by this user and cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        <FaTimes className="me-1" /> Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteUser}
                        disabled={deleting}
                    >
                        <FaCheck className="me-1" /> {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminPage;