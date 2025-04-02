// frontend/src/pages/HomePage.js
import React, { useContext } from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCodeBranch, FaComments, FaSearch, FaUserFriends } from 'react-icons/fa';
import { AuthContext } from '../components/Auth/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white rounded p-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-4 mb-3">Programming Channels</h1>
              <p className="lead mb-4">
                A community platform for asking and answering programming questions.
                Join the discussion, share your knowledge, and get help from other developers.
              </p>
              {!isAuthenticated && (
                <Link to="/auth">
                  <Button variant="light" size="lg">Get Started</Button>
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/channels">
                  <Button variant="light" size="lg">Browse Channels</Button>
                </Link>
              )}
            </Col>
            <Col md={4} className="d-none d-md-block">
              <div className="text-center">
                <FaCodeBranch size={120} />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <h2 className="text-center mb-4">Features</h2>
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="feature-icon mb-3">
                <FaComments size={50} className="text-primary" />
              </div>
              <Card.Title>Channel Discussions</Card.Title>
              <Card.Text>
                Create or join topic-specific channels for focused discussions on programming languages, frameworks, and tools.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="feature-icon mb-3">
                <FaSearch size={50} className="text-primary" />
              </div>
              <Card.Title>Powerful Search</Card.Title>
              <Card.Text>
                Easily find answers to your questions with our advanced search capabilities. Filter by user, content, and more.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="feature-icon mb-3">
                <FaUserFriends size={50} className="text-primary" />
              </div>
              <Card.Title>Community Ratings</Card.Title>
              <Card.Text>
                Upvote helpful responses and build your reputation in the community by providing quality answers.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <div className="bg-light rounded p-5 text-center">
        <h2 className="mb-3">Ready to Get Started?</h2>
        <p className="mb-4">
          Join our community of developers and start asking and answering questions today.
        </p>
        {!isAuthenticated ? (
          <Link to="/auth">
            <Button variant="primary" size="lg">Sign Up Now</Button>
          </Link>
        ) : (
          <Link to="/channels">
            <Button variant="primary" size="lg">Explore Channels</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;