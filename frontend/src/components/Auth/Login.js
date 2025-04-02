// frontend/src/components/Auth/Login.js
import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const Login = () => {
  const { login, error } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { username, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate input
    if (!username.trim() || !password) {
      setFormError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      await login({ username, password });
      // Redirect is handled by AuthPage
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4">Login</h2>
      
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
            placeholder="Enter your username"
            required
          />
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
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-100" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </div>
  );
};

export default Login;