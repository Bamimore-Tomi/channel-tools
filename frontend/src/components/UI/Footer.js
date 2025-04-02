// frontend/src/components/UI/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <h5>Programming Channels</h5>
            <p className="text-muted">
              A community platform for asking and answering programming questions.
            </p>
          </Col>
          
          <Col md={3} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted">Home</a></li>
              <li><a href="/channels" className="text-muted">Channels</a></li>
              <li><a href="/search" className="text-muted">Search</a></li>
            </ul>
          </Col>
          
          <Col md={3}>
            <h5>About</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted">Terms of Service</a></li>
              <li><a href="/" className="text-muted">Privacy Policy</a></li>
              <li><a href="/" className="text-muted">Contact</a></li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-3 bg-secondary" />
        
        <div className="text-center text-muted">
          <small>&copy; {currentYear} Programming Channels. All rights reserved.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;