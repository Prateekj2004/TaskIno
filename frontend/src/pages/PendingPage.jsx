import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { layoutClasses, SORT_OPTIONS } from '../assets/dummy';
import { Clock, Filter, ListChecks, Plus } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import TaskModel from '../components/TaskModel';

const PendingPage = () => {
  const { tasks = [], refreshTasks } = useOutletContext();
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModel, setShowModel] = useState(false);

  const sortedPendingTasks = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        !t.completed ||
        (typeof t.completed === 'string' && t.completed.toLowerCase() === 'no')
    );
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority?.toLowerCase()] - order[a.priority?.toLowerCase()];
    });
  }, [tasks, sortBy]);

  return (
    <div className={`${layoutClasses.container} px-4 md:px-8 py-4`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListChecks className="text-blue-500" />
            Pending Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-2 md:ml-6">
            {sortedPendingTasks.length} task
            {sortedPendingTasks.length !== 1 && 's'} needing your attention
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-lg p-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>

      <div
        className="mb-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer px-4 py-2 hover:bg-blue-100 transition"
        onClick={() => setShowModel(true)}
      >
        <div className="flex items-center gap-3 text-slate-600 hover:text-blue-600">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Plus className="text-blue-500" size={18} />
          </div>
          <span className="font-medium">Add new task</span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPendingTasks.length === 0 ? (
          <div className="max-w-xs mx-auto py-6 text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-blue-100 rounded-full mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">All caught up!</h3>
            <p className="text-sm text-slate-500 mb-4">No pending tasks – great work!</p>
            <button
              onClick={() => setShowModel(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition"
            >
              Create New Task
            </button>
          </div>
        ) : (
          sortedPendingTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              showCompleteCheckbox
              onEdit={() => {
                setSelectedTask(task);
                setShowModel(true);
              }}
              onRefresh={refreshTasks}
            />
          ))
        )}
      </div>

      <TaskModel
        isOpen={!!selectedTask || showModel}
        onClose={() => {
          setShowModel(false);
          setSelectedTask(null);
          refreshTasks();
        }}
        tasktoEdit={selectedTask}
      />
    </div>
  );
};

export default PendingPage;