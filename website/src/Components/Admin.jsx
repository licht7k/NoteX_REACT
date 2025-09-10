import React, { useEffect, useState, useTransition } from 'react'
import Navbar from './Navbar'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { IoIosSettings } from 'react-icons/io'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { SiOneplus } from 'react-icons/si'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  //Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [total, setTotal] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const [jumpToPage, setJumpToPage] = useState('')
  const [roleDropdown, setRoleDropdown] = useState(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  }

  const fetchUsers = async (page = 1, itemsPerPage = perPage) => {
    try {
      setLoading(true)
      const response = await axios.get(`http://127.0.0.1:8000/api/admin/users?page=${page}&per_page=${itemsPerPage}`, getAuthHeaders())

      // const sortedUsers = response.data.sort((a,b) => {
      //   const roleOrder = { 'admin' : 1, 'user' : 2};
      //   return roleOrder[a.role] - roleOrder[b.role];
      // })

      //update all pagination state
      setUsers(response.data.data)
      setCurrentPage(response.data.current_page)
      setLastPage(response.data.last_page)
      setPerPage(response.data.per_page)
      setTotal(response.data.total)
      setFrom(response.data.from)
      setTo(response.data.to)
      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      if (err.response?.status === 403) {
        setError('Access Denied. Admin privileges required.')
      } else if (err.response?.status === 401) {
        setError('Authentication Error. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        setError('Failed to fetch users. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage, perPage)
  }, [currentPage, perPage])


  useEffect(() => {
   const userData = localStorage.getItem('user')
   if(userData){
    try {
      setCurrentUser(JSON.parse(userData))
    } catch (e) {
      console.error('Error parsing user data', e);
    }
   }
  }, [])
  

  const isAdmin = currentUser?.role === 'admin'

  // pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page)
    }
  }

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value)
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisible = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(lastPage, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-700 '
      case 'user':
        return 'text-green-500 '
      case 'moderator':
        return 'text-blue-500 '
      default:
        return 'bg-gray-100 text-white'
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading Admin Panel...</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
        </div>
      </>
    )
  }

  const handleDelete = async (userId, userName, currentRole) => {

    if(!isAdmin){
      alert('Access Denied. Only admin can delete user accounts')
      return
    }

    if (currentRole === 'admin') {
      alert('Cannot Delete Admin Accounts')
      return
    }
    if (!window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/admin/users/${userId}`, getAuthHeaders())

      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== userId))
        setTotal(total - 1)
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
        alert('User deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      if (err.response?.status === 403) {
        alert('Access Denied. You do not have permission to delete users.')
      } else if (err.response?.status === 401) {
        alert('Authentication Error. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (err.response?.status === 404) {
        alert('User not found or already deleted.')
        fetchUsers(currentPage, perPage)
      } else {
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  const handleChange = async (userId, currentRole) => {

    if(!isAdmin){
      alert('Access Denied. Only admins can change user roles.')
      return
    }

    if (currentRole === 'admin') {
      alert('Cannot change role of admin users.')
      return
    }
    
    if (roleDropdown === userId) {
      setRoleDropdown(null)
    } else {
      setRoleDropdown(userId)
    }
  }

  const handleRoleChange = async (userId, userName, newRole) => {

    if(!isAdmin){
      alert('Access Denied. Only admin can change user roles ')
    }

    if (!window.confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) {
      setRoleDropdown(null)
      return
    }

    try {
      const response = await axios.patch(`http://127.0.0.1:8000/api/admin/users/${userId}/role`, { role: newRole }, getAuthHeaders())

      if (response.status === 200) {
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      }

      setRoleDropdown(null)
      alert(`User ${userName}'s role changed to ${newRole} successfully`)
      setRoleDropdown(null)
    } catch (err) {
      console.error('Erro changing user role:')
      alert('Failed to change user role. Please try again.')
      setRoleDropdown(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="px-4 py-4 text-md text-center text-lg font-bold">User Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/5 px-6 py-3 text-center text-sm font-medium">NAME</th>
                  <th className="w-1/5 px-6 py-3 text-center text-sm font-medium">EMAIL</th>
                  <th className="w-1/5 px-6 py-3 text-center text-sm font-medium">ROLE</th>
                  <th className="w-1/5 px-6 py-3 text-center text-sm font-medium">JOINED</th>
                  <th className="w-1/5 px-6 py-3 text-center text-sm font-medium">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-100 ${currentUser?.id === user.id ? 'bg-gray-300' : ''}`}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-center uppercase">{user.name}</div>
                    </td>

                    <td>
                      <div className="text-sm font-medium text-gray-900 text-center">{user.email}</div>
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold uppercase rounded-full ${getRoleColor(user.role)}`}>{user.role}</span>
                    </td>

                    <td>
                      <div className="text-center text-sm font-medium text-gray-900">{formatDate(user.created_at)}</div>
                    </td>

                    <td>
                      <div className="flex justify-center text-center text-sm font-medium text-gray-900">
                        <div className="relative">
                          <IoIosSettings
                            title={!isAdmin ? 'Access Denied - Admin only' : user.role === 'admin' ? 'Cannot change admin role' : 'Change role'}
                            className={`${!isAdmin ||  user.role === 'admin' ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                            size={19}
                            onClick={() => handleChange(user.id, user.name, user.role)}
                          />

                          {roleDropdown === user.id && user.role !== 'admin' && (
                            <div className="absolute top-0 right-7 bg-white border border-gray-500 rounded-md shadow-lg overflow-visible min-w-32">
                              <button
                                onClick={() => handleRoleChange(user.id, user.name, 'admin')}
                                className="text-red-600 cursor-pointer block w-full text-left rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                              >
                                Promote to Admin
                              </button>
                              <hr className="text-gray-500" />
                              <button
                                onClick={() => handleRoleChange(user.id, user.name, 'moderator')}
                                className="text-blue-600 cursor-pointer block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                              >
                                Promote to Moderator
                              </button>
                            </div>
                          )}
                        </div>

                        <RiDeleteBin6Line
                          title={!isAdmin ? 'Access Denied - Admin only' : user.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}
                          className={`ml-2 ${!isAdmin || user.role === 'admin' ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                          size={18}
                          onClick={() => handleDelete(user.id, user.name, user.role)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* items per page selector */}

          <div className="border-t px-6 py-2 border-b border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {from} to {to} of {total} users
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select value={perPage} onChange={handlePerPageChange} className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>

          {/* pagination controls */}

          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              {/* left side */}
              <div className="text-sm text-gray-600">
                Page {currentPage} of {lastPage}
              </div>

              {/* center  */}
              <div className="flex items-center ml-10 space-x-1">
                {/* previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded text-sm ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaChevronLeft size={12} />
                </button>

                {/* first page */}
                {currentPage > 3 && !getPageNumbers().includes(1) && (
                  <>
                    <button onClick={() => handlePageChange(1)} className="px-3 py-2 rounded text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                      1
                    </button>
                    {currentPage > 4 && <span className="text-gray-500">...</span>}
                  </>
                )}

                {/* page numbers */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded text-sm ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}

                {/* last page */}
                {currentPage < lastPage - 2 && !getPageNumbers().includes(lastPage) && (
                  <>
                    {currentPage < lastPage - 3 && <span className="text-gray-500">...</span>}
                    <button onClick={() => handlePageChange(lastPage)} className="px-3 py-2 rounded text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                      {lastPage}
                    </button>
                  </>
                )}

                {/* next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === lastPage}
                  className={`px-3 py-2 rounded text-sm ${
                    currentPage === lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaChevronRight size={12} />
                </button>
              </div>

              {/* right side, quick jump */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Go to: </span>
                <input
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  type="number"
                  min="1"
                  max={lastPage}
                  value={jumpToPage}
                  placeholder={currentPage.toString()}
                  onChange={(e) => {
                    setJumpToPage(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt(jumpToPage)
                      if (page >= 1 && page <= lastPage) {
                        handlePageChange(page)
                        setJumpToPage('')
                      }
                    }
                  }}
                  onBlur={() => {
                    const page = parseInt(jumpToPage)
                    if (page >= 1 && page <= lastPage) {
                      handlePageChange(page)
                    }
                    setJumpToPage('')
                  }}
                />
              </div>
            </div>
            {/* empty state */}
            {users.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500">No users found</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Admin
