import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../recoil/authAtom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserType: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedUserType }) => {
  const authState = useRecoilValue(authAtom);

  // Check if user is authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the correct user type
  if (authState.userType !== allowedUserType.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and user type is correct, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
