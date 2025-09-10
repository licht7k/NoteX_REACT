import React from 'react'
import { FaRegEye } from 'react-icons/fa'
import { FaRegEyeSlash } from 'react-icons/fa'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {

  //login anchor must display if user successfully registered an account

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/register', formData);

    alert('Account Registered Successfully');
    
  } catch (error) {
    console.log('Full error object:', error);
    console.log('Error response data:', error.response?.data);
    console.log('Error response status:', error.response?.status);
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      let errorMessage = 'Validation failed:\n';
      Object.keys(errors).forEach(key => {
        errorMessage += `${key}: ${errors[key].join(', ')}\n`;
      });
      alert(errorMessage);
    } else {
      alert('Registration Failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
  }
}

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordIcon, setShowPasswordIcon] = useState(false)

  const togglePasswordVisible = () => {
    setShowPassword(true)
  }

  const togglePasswordNotVisible = () => {
    setShowPassword(false)
  }

  const togglePasswordIcon = () => {
    setShowPasswordIcon(!showPasswordIcon)
  }

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen ">
          <div className="bg-white p-4 rounded-4xl shadow-md w-100 h-125">
            <div className="px-6">
              <h3 className="text-2xl font-bold text-center mb-8 mt-8">Register</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="ml-2 font-medium">Username</label>
                  <input type="text" name='name' className="border border-gray-300 p-2 rounded-md w-70 block mx-auto mt-2 focus:outline-none text-sm" value={formData.name} onChange={handleChange} required/>
                </div>
                <div className="mb-5">
                  <label className="ml-2 font-medium">Email</label>
                  <input type="email" name='email' className="border border-gray-300 p-2 rounded-md w-70 block mx-auto mt-2 focus:outline-none text-sm" value={formData.email} onChange={handleChange} required/>
                </div>
                <div className="mb-2">
                  <label className="ml-2 font-medium">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name='password' className="border border-gray-300 p-2 rounded-md w-70 block mx-auto mt-2 focus:outline-none text-sm" value={formData.password} onChange={handleChange} required/>
                    <FaRegEye className={`absolute right-8 top-3 cursor-pointer ${showPassword ? 'hidden' : ''}`} onClick={togglePasswordVisible} />
                    <FaRegEyeSlash className={`absolute right-8 top-3 cursor-pointer ${showPassword ? '' : 'hidden'}`} onClick={togglePasswordNotVisible} />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-gray-200 text-gray-800 p-2 mb-2 rounded-4xl block mx-auto w-70 font-medium cursor-pointer">
                    SIGN UP
                  </button>
                </div>
              </form>
              <div className='text-center'>
              <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login') }} className='text-blue-500 text-md '>Login</a>
              </div>
            </div>
          </div>
        </div>
  )
}

export default Register