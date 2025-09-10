import React from 'react'
import Navbar from './Components/Navbar'
import Hero from './Components/Hero'
import Login from './Page/Login'
import { Routes, Route } from 'react-router-dom'
import Register from './Page/Register'
import ProtectedRoute from './Components/ProtectedRoute'
import Admin from './Components/Admin'   

const App = () => {
  return (
    <>
      
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Hero />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Hero />
              </ProtectedRoute>
            }
          />
          {/* private route */}
          <Route 
           path='/admin'
           element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
           }
          />
        </Routes>
      
    </>
  )
}

export default App
