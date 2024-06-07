import React from 'react';
import Avatar from 'react-avatar';

function Client({ username }) {

  return (
    <div className="client-container">
      <Avatar name={username.toString()} size={50} round="14px" className="avatar" />
      <span className='username'>{username.toString()}</span>
      <style jsx>{`
        .client-container {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .avatar {
          margin-right: 10px;
        }
        
        .username {
          margin-left: 10px;
          font-weight: bold;
          color: #fff;
        }
      `}</style>
    </div>
  );
}

export default Client;
