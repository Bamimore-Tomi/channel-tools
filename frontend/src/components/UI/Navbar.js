// frontend/src/components/UI/Navbar.js
import React, { useContext, useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Form, FormControl, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaSignOutAlt, FaSignInAlt, FaUserShield } from 'react-icons/fa';
import { AuthContext } from '../Auth/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          ProgrammingChannels
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/channels">Channels</Nav.Link>
          </Nav>
          
          <Form className="d-flex mx-2" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-light" type="submit">
              <FaSearch />
            </Button>
          </Form>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <NavDropdown 
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user.display_name}
                    </span>
                  } 
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to={`/users/${user.id}`}>
                    My Profile
                  </NavDropdown.Item>
                  
                  {isAdmin && (
                    <NavDropdown.Item as={Link} to="/admin">
                      <FaUserShield className="me-1" />
                      Admin Panel
                    </NavDropdown.Item>
                  )}
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-1" />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <Nav.Link as={Link} to="/auth">
                <FaSignInAlt className="me-1" />
                Login / Register
              </Nav.Link>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;