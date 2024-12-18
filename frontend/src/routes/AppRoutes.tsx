import React from 'react';
import {   Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import {CustomerPage }from '../pages/CustomerPage';
import Query from '../pages/Query';
import ProtectedRoute from '../component/ProtectectedRoute';
import Home from "../pages/Home"
import Signup from '../pages/Signup'
import Unauthorized from '@/component/Unauthorized';
const AppRoutes: React.FC = () => {
  return (

      <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/signup' element={<Signup/>}/>
             
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedUserType="customer">
              <CustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internal"
          element={
            <ProtectedRoute allowedUserType="internal">
              <Query />
            </ProtectedRoute>
          }
        />
           <Route
          path="/unauthorized"
          element={
            <ProtectedRoute allowedUserType="internal">
              <Unauthorized />
            </ProtectedRoute>
          }
        />
      </Routes>
 
  );
};

export default AppRoutes;
