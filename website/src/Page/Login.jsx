import React from 'react'
import { FaRegEye } from 'react-icons/fa'
import { FaRegEyeSlash } from 'react-icons/fa'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Login = () => {
  const navigate = useNavigate()

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

  const [formData, setFormData] = useState({
    email: '', password: ''
  })

  const handleChange =(e) => {
    setFormData(
     { ...formData,
      [e.target.name]: e.target.value}
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Logged in', formData);

    
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', formData);
      
      if (response.status === 200){
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user))
        alert('Login Successful!')
        navigate('/home');
      }


    } catch (error) {
      console.log('Login Error: ', error);
      console.log('Error Response: ', error.response?.data);
      
      const status = error.response.status;
      const errorData = error.response.data;

      if(status === 401){
        alert('Invalid email/password. Please try again');
      }else if(status === 404){
        alert('Account not registered. Please sign up first.');
      }else if(status === 422){
        if(errorData.errors){
          let errorMessage = 'Validation failed:\n';
          Object.keys(errorData.errors).forEach(key =>{
            errorMessage += `${key}: ${errorData.errors[key].join(', ')}\n`
          });
          alert(errorMessage)
        }else{
          alert('Please check your input and try again.')
        }
      }else if(errorData.errorMessage){
        alert(errorData.message);
      }else{
        alert('Login Failed. Please try again.')
      }

      
    }

  }


  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen ">
      <div className="bg-white p-4 rounded-4xl shadow-md w-100 h-110">
        <div className="px-6">
          <h3 className="text-2xl font-bold text-center mb-8 mt-8">Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="ml-2 font-medium">Email</label>
              <input type="text" name='email' className="border border-gray-300 p-2 rounded-md w-70 block mx-auto mt-2 focus:outline-none text-sm" value={formData.email} onChange={handleChange} required />
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
              <button type='submit' className="bg-gray-200 text-gray-800 p-2 rounded-4xl block mx-auto w-70 font-medium cursor-pointer ">
                SUBMIT
              </button>
            </div>
            <div className="text-center mt-3">
              <p className="text-gray-600">Don't have an account?</p>
              <a
                href="#"
                className="text-blue-500"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/register')
                }}
              >
                Register
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
