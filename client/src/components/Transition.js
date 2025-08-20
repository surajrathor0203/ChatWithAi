import React from 'react';

const Transition = ({ visible, children }) => {
  return (
    <div className={visible ? 'fade-in' : 'fade-out'}>
      {children}
    </div>
  );
};

export default Transition;
