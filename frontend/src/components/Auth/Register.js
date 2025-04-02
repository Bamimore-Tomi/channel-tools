// frontend/src/components/Auth/Register.js
import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const Register = () => {
  const { register, error } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    display_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { username, password, confirmPassword, display_name } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate input
    if (!username.trim() || !password || !display_name.trim()) {
      setFormError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register({ username, password, display_name });
      // Redirect is handled by AuthPage
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4">Register</h2>
      
      {(formError || error) && (
        <Alert variant="danger">{formError || error}</Alert>
      )}
      
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={username}
            onChange={onChange}
            placeholder="Choose a username"
            required
          />
          <Form.Text className="text-muted">
            Username must be at least 3 characters.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="display_name">
          <Form.Label>Display Name</Form.Label>
          <Form.Control
            type="text"
            name="display_name"
            value={display_name}
            onChange={onChange}
            placeholder="Enter your display name"
            required
          />
          <Form.Text className="text-muted">
            This is the name that will be shown with your posts.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Enter your password"
            required
          />
          <Form.Text className="text-muted">
            Password must be at least 6 characters.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Confirm your password"
            required
          />
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-100" 
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Form>
    </div>
  );
};

export default Register;