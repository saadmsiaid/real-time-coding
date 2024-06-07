import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/NavBar';
import { AuthContext } from './context/AuthContext';
import Protected from './PrivateRoute';
import './App.css';

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <>
      <div>
        <Navbar />
        <Toaster position='top-center' />
      </div>
      <Routes>
        <Route path='/' element={<Protected isSignedIn={auth.isAuthenticated}><Home /></Protected>} />
        <Route path='/editor/:roomId' element={<Protected isSignedIn={auth.isAuthenticated}><EditorPage /></Protected>} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
