import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-hot-toast';
import '../style/Register.css';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      console.log("Registration successful");
      navigate('/login');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error('Registration failed. Please try again.'); 
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-dark text-light">
      <div className="card bg-secondary shadow p-4" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              className="form-control mb-3"
              placeholder="Username"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-control mb-3"
              placeholder="Email"
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              className="form-control mb-3"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
