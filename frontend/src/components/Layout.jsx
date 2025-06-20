import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import axios from 'axios'
import { Circle, Clock, TrendingUp, Zap } from 'lucide-react'

const Layout = ({ onLogout, user }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No Auth Token Found')

      const { data } = await axios.get('http://localhost:4000/api/tasks/gp', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : []

      setTasks(arr)
    } catch (error) {
      console.error(error)
      if (
        error.response?.data?.message?.toLowerCase().includes('expired') ||
        error.response?.status === 401
      ) {
        localStorage.clear()
        window.location.href = '/login'
      }
      setError(error.message || 'Could not load tasks')
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(
      (t) =>
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes')
    ).length

    const totalCount = tasks.length
    const pendingCount = totalCount - completedTasks
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0
    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    }
  }, [tasks])

  const StatsCard = ({ title, value, icon, color }) => (
    <div className='p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:border-blue-200 group'>
      <div className='flex items-center gap-3'>
        <div className={`p-2 rounded-lg ${color} bg-opacity-20 group-hover:bg-opacity-30`}>
          {icon}
        </div>
        <div>
          <p className='text-lg font-bold text-slate-800'>{value}</p>
          <p className='text-xs text-slate-500 font-medium'>{title}</p>
        </div>
      </div>
    </div>
  )

  if (loading)
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
      </div>
    )

  if (error)
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items justify-center'>
        <div className='bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md'>
          <p className='font-medium mb-2'>Error loading tasks</p>
          <p className='text-sm'>{error}</p>
          <button
            onClick={fetchTasks}
            className='mt-4 py-2 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    )

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user={user} tasks={tasks} />
      <div className='ml-0 xl:ml-64 lg:ml-64 md:ml-16 pt-16 p-3 sm:p-4 md:p-4 transition-all duration-300'>
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
          <div className='xl:col-span-2 space-y-3 sm:space-y-4'>
            <Outlet context={{ tasks, refreshTasks: fetchTasks }} />
          </div>
          <div className='xl:col-span-1 space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-xl p-5 shadow-sm border border-slate-100'>
              <h3 className='text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-blue-500' />
                Productivity Dashboard
              </h3>

              <div className='grid grid-cols-2 gap-4 mb-6'>
                <StatsCard
                  title='Total Tasks'
                  value={stats.totalCount}
                  icon={<Circle className='w-4 h-4 text-blue-500' />}
                  color="bg-blue-100"
                />
                <StatsCard
                  title='Completed'
                  value={stats.completedTasks}
                  icon={<Circle className='w-4 h-4 text-emerald-500' />}
                  color="bg-emerald-100"
                />
                <StatsCard
                  title='Pending'
                  value={stats.pendingCount}
                  icon={<Circle className='w-4 h-4 text-indigo-500' />}
                  color="bg-indigo-100"
                />
                <StatsCard
                  title='Completion Rate'
                  value={`${stats.completionPercentage} %`}
                  icon={<Zap className='w-4 h-4 text-blue-500' />}
                  color="bg-blue-100"
                />
              </div>

              <hr className='my-4 border-slate-100' />

              <div className='space-y-3'>
                <div className='flex items-center justify-between text-slate-700'>
                  <span className='text-sm font-medium flex items-center gap-1.5'>
                    <Circle className='w-3 h-3 text-blue-500 fill-blue-500' />
                    Task Progress
                  </span>
                  <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full'>
                    {stats.completedTasks}/{stats.totalCount}
                  </span>
                </div>

                <div className='relative pt-1'>
                  <div className='flex gap-1.5 items-center'>
                    <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500'
                        style={{ width: `${stats.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl p-5 shadow-sm border border-slate-100'>
              <h3 className='text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2'>
                <Clock className='w-5 h-5 text-blue-500' />
                Recent Activity
              </h3>

              <div className='space-y-3'>
                {tasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id || task.id}
                    className='flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-100'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-slate-700 break-words whitespace-normal'>
                        {task.title}
                      </p>
                      <p className='text-xs text-slate-500 mt-1'>
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                        task.completed 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className='text-center py-6 px-2'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center'>
                      <Clock className='w-8 h-8 text-blue-500' />
                    </div>
                    <p className='text-sm text-slate-500'>No recent activity</p>
                    <p className='text-xs text-slate-400 mt-1'>Tasks will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout