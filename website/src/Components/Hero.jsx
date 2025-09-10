import React, { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { PiDotsThreeLight } from 'react-icons/pi'
import { TfiSave } from 'react-icons/tfi'
import { IoArrowBackCircleOutline, IoEye } from 'react-icons/io5'
import { IoEyeOutline } from 'react-icons/io5'
import { MdDelete } from 'react-icons/md'
import Navbar from './Navbar'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

const Hero = () => {
  
  const [newNote, setNewNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [notes, setNotes] = useState([])
  const [viewNote, setViewNote] = useState(null)

  const openViewNote = (note) => {
    setViewNote(note)
    setNewNoteContent(note.content || '')
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
      return{
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      }
  }

  const closeViewNote = () => setViewNote(null)

  // useEffect(() => {
  //   axios
  //     .get('http://localhost:8000/api/notes', getAuthHeaders())
  //     .then((res) => setNotes(res.data))
  //     .catch((err) => console.log(err))
  // }, [])

  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) return
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/notes', {
        content: newNoteContent
      }, getAuthHeaders())
      setNotes((prev) => [res.data, ...prev])
      setNewNoteContent('')
      setNewNote(false)
      alert('Note saved successfully')
      console.log('Note saved successfully')
    } catch (e) {
      console.error(e)
      if(e.response?.status === 401){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Failed to save note. Please try again.');
      }
    }
  }

  const handleUpdateNote = async (id) => {
    if (!viewNote) return
    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/notes/${viewNote.id}`, {
        content: newNoteContent
      }, getAuthHeaders());
      // update local list and currently viewed note
      setNotes((prev) => prev.map((n) => (n.id === res.data.id ? res.data : n)))
      setViewNote(res.data)
      alert('Note updated successfully')
      closeViewNote()
    } catch (e) {
      console.error(e)
    }
  }

  const loadNotes = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/notes', getAuthHeaders());
      setNotes(res.data)
    } catch (e) {
      console.error(e)
      if (e.response?.status === 401){
        alert('Session expired. Please login again.')
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/notes/${id}`, getAuthHeaders())
      console.log('Delete response:', response.status)
      
      // Only update UI if backend delete was successful
      if (response.status === 200 || response.status === 204) {
        setNotes((prev) => prev.filter((n) => n.id !== id))
        alert('Note deleted successfully')
        console.log('Note deleted successfully')
      } else {
        alert('Failed to delete note')
      }
    } catch (e) {
      console.error('Delete error:', e)
      if (e.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        alert('Failed to delete note. Please try again.')
      }
    }
  }

  const handleNewNote = () => {
    setNewNote(true);
    setNewNoteContent('');
  }

  const handleCloseNote = () => {
    setNewNote(false)
    setNewNoteContent('');
  }

  

  return (

    <>
    <Navbar />
    <div className="mt-5 w-323 mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-center gap-3 mb-3 -ml-10">
        <button onClick={handleNewNote}>
          <FiPlus className="text-black cursor-pointer" title='Add new note' size={24} />
        </button>
        <input type="text" className="border w-100 rounded-2xl py-1 px-5 border-black focus:outline-none " placeholder="Search..." />
      </div>

      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No notes available. Click the plus icon to add a new note.</div>
      ) : (
        
        <div className='flex flex-wrap gap-5 justify-start'>
          {notes.map((note) => (
            <div key={note.id} className="relative w-100 h-50 max-auto bg-amber-100 rounded-lg shadow-md border border-gray-200 p-4 mt-3">
              <div className="bg-amber-200 absolute shadow-sm rounded-t-lg top-0 left-0 w-full h-8" >
                <IoEyeOutline title='View full note' className="absolute top-2 right-10 text-black cursor-pointer mr-1" size={20} onClick={() =>   openViewNote(note)} />
                <MdDelete
                  title='Delete note'
                  className="absolute top-2 right-4 text-black cursor-pointer"
                  size={20}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this note?')) handleDelete(note.id)
                  }}
                /> 
              </div>
              <p className="mt-8 line-clamp-5 text-md">{note.content}</p>
            </div>
          )) }
        </div>
      )}

      {viewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeViewNote}>
          <div onClick={(e) => e.stopPropagation()} className=" relative bg-amber-100 p-6 rounded-lg shadow-md max-w-7xl mx-auto">
            <div className="bg-amber-200 shadow-sm absolute top-0 left-0 w-full h-10 rounded-t-lg">
              <div className="absolute flex top-2 right-6 items-center gap-4">
                <TfiSave className="cursor-pointer" onClick={() => handleUpdateNote(viewNote.id)} size={18} />
                <IoArrowBackCircleOutline className="right-5 cursor-pointer" size={25} onClick={closeViewNote} />
              </div>
            </div>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              name="notes"
              id="notes"
              placeholder="Add note"
              className="mt-7 w-120 h-120 focus:outline-none"
            ></textarea>
          </div>
        </div>
      )}

      {newNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCloseNote}>
          <div onClick={(ev) => ev.stopPropagation()} className=" relative bg-amber-100 p-6 rounded-lg shadow-md max-w-7xl mx-auto">
            <div className="absolute bg-amber-200 shadow-sm top-0 left-0 w-full h-10 rounded-t-lg">
              <div className="absolute flex top-2 right-6 items-center gap-4">
                <TfiSave className="cursor-pointer" onClick={handleSaveNote} size={18} />
                <IoArrowBackCircleOutline className="right-5 cursor-pointer" size={25} onClick={handleCloseNote} />
              </div>
            </div>
            <textarea
              value={newNoteContent} 
              onChange={(e) => setNewNoteContent(e.target.value)}
              name="notes"
              id="notes"
              placeholder="Add note"
              className="mt-7 w-120 h-120 focus:outline-none"
            ></textarea>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default Hero
