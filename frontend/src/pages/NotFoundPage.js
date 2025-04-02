// frontend/src/pages/NotFoundPage.js
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
    return (
        <Container className="text-center py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <FaExclamationTriangle className="text-warning mb-4" size={80} />
                    <h1 className="display-4 mb-4">Page Not Found</h1>
                    <p className="lead mb-5">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/">
                        <Button variant="primary" size="lg">
                            <FaHome className="me-2" />
                            Return to Home
                        </Button>
                    </Link>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;