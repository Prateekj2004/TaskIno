import React, { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TASK } from '../assets/dummy';
import { PlusCircle, Save, X } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api/tasks';

const TaskModel = ({ isOpen, onClose, tasktoEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) return;

    if (tasktoEdit) {
      const normalized = tasktoEdit.completed === true ? 'Yes' : 'No';
      setTaskData({
        ...DEFAULT_TASK,
        title: tasktoEdit.title || '',
        description: tasktoEdit.description || '',
        priority: tasktoEdit.priority || 'Low',
        dueDate: tasktoEdit.dueDate?.split('T')[0] || '',
        completed: normalized,
        _id: tasktoEdit._id,
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }

    setError(null);
  }, [isOpen, tasktoEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isEdit = Boolean(taskData._id);
      const url = isEdit ? `${API_BASE}/${taskData._id}/gp` : `${API_BASE}/gp`;
      const payload = {
        ...taskData,
        completed: taskData.completed === 'Yes' // convert to boolean
      };

      const resp = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        if (resp.status === 401) return onLogout?.();
        const err = await resp.json();
        throw new Error(err.message || 'Failed to save task');
      }

      const saved = await resp.json();
      onSave?.(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [taskData, today, getHeaders, onLogout, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4'>
      <div className='bg-white border border-slate-100 rounded-xl max-w-md w-full shadow-lg relative p-6 animate-fadeIn'>
        <div className='text-xl font-bold text-slate-800 flex justify-between items-center mb-4'>
          <div className='flex items-center gap-2'>
            {taskData._id ? <Save className='text-blue-500 w-5 h-5' /> : <PlusCircle className='text-blue-500 w-5 h-5' />}
            {taskData._id ? 'Edit Task' : 'Create New Task'}
          </div>
          <button onClick={onClose} className='p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-blue-700'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <div className='text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100'>{error}</div>}

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Task Title</label>
            <input type='text' name='title' value={taskData.title} onChange={handleChange} className='w-full border border-slate-200 p-2 rounded-lg' required />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Description</label>
            <textarea name='description' value={taskData.description} onChange={handleChange} className='w-full border border-slate-200 p-2 rounded-lg' />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Priority</label>
            <select name='priority' value={taskData.priority} onChange={handleChange} className='w-full border border-slate-200 p-2 rounded-lg'>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Due Date</label>
            <input type='date' name='dueDate' value={taskData.dueDate} onChange={handleChange} min={today} className='w-full border border-slate-200 p-2 rounded-lg' required />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Completed</label>
            <select name='completed' value={taskData.completed} onChange={handleChange} className='w-full border border-slate-200 p-2 rounded-lg'>
              <option value='No'>No</option>
              <option value='Yes'>Yes</option>
            </select>
          </div>

          <button type='submit' disabled={loading} className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:shadow-md transition'>
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModel;