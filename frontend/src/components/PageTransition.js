import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('page-enter');

  useEffect(() => {
    // Bắt đầu hiệu ứng fade-out
    setTransitionStage('page-exit');

    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('page-enter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250); // Thời gian fade-out

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className={`page-transition ${transitionStage}`}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
