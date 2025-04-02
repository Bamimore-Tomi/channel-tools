// frontend/src/pages/AuthPage.js
import React, { useState, useContext, useEffect } from 'react';
import { Row, Col, Card, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/Auth/AuthContext';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from || '/channels';
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, location.state]);
  
  // Check query params for initial tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [location.search]);

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card className="shadow">
          <Card.Header>
            <Nav variant="tabs" className="nav-fill">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'login'} 
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === 'register'} 
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-4">
            {activeTab === 'login' ? <Login /> : <Register />}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AuthPage;