import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, MoreVertical, Calendar } from 'lucide-react';
import {
  getPriorityBadgeColor,
  MENU_OPTIONS,
  TI_CLASSES
} from '../assets/dummy';
import { format, isToday } from 'date-fns';
import TaskModel from './TaskModel';

const API_BASE = 'http://localhost:4000/api/tasks';

const TaskItem = ({ task, onRefresh, onLogout, showCompleteCheckbox = true }) => {
  // ✅ Prevent crash when task is undefined
  if (!task) return null;

  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, 'yes'].includes(
      typeof task.completed === 'string'
        ? task.completed.toLowerCase()
        : task.completed
    )
  );
  const [showEditModel, setShowEditModel] = useState(false);
  const [subtasks, setSubTasks] = useState(task.subtasks || []);

  useEffect(() => {
    setIsCompleted(
      [true, 1, 'yes'].includes(
        typeof task.completed === 'string'
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found');
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? 'border-emerald-500'
    : getPriorityBadgeColor(task.priority).split(' ')[0];

  const handleComplete = async () => {
    const newStatus = isCompleted ? 'No' : 'Yes';
    try {
      await axios.put(
        `${API_BASE}/${task._id}/gp`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === 'edit') setShowEditModel(true);
    if (action === 'delete') handleDelete();
  };

  const handleDelete = async () => {
    if (!task._id) {
      console.error('task._id is undefined!');
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {
        headers: getAuthHeaders()
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length
    ? (subtasks.filter((st) => st.completed).length / subtasks.length) * 100
    : 0;

  return (
    <>
      <div className={`${TI_CLASSES.wrapper} ${isCompleted ? 'opacity-75' : ''}`}>
        <div className={TI_CLASSES.leftContainer}>
          {showCompleteCheckbox && (
            <button
              onClick={handleComplete}
              className={`${TI_CLASSES.completeBtn} ${
                isCompleted ? 'text-emerald-500' : 'text-slate-300'
              }`}
            >
              <CheckCircle2
                size={18}
                className={`${TI_CLASSES.checkboxIconBase} ${
                  isCompleted ? 'fill-emerald-500' : ''
                }`}
              />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3
                className={`${TI_CLASSES.titleBase} ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className={TI_CLASSES.description}>{task.description}</p>
            )}
          </div>
        </div>

        <div className={TI_CLASSES.rightContainer}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={TI_CLASSES.menuButton}
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
            </button>

            {showMenu && (
              <div className={TI_CLASSES.menuDropdown}>
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors duration-200"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className={`${TI_CLASSES.dateRow} ${task.dueDate && isToday(new Date(task.dueDate)) ? 'text-blue-500 font-semibold' : 'text-slate-500'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate
                ? isToday(new Date(task.dueDate))
                  ? 'Today'
                  : `Due ${format(new Date(task.dueDate), 'MMM dd')}`
                : '-'}
            </div>

            <div className={TI_CLASSES.createdRow}>
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {task.createdAt ? `Created ${format(new Date(task.createdAt), 'MMM dd')}` : 'No date'}
            </div>
          </div>
        </div>
      </div>

      <TaskModel
        isOpen={showEditModel}
        onClose={() => setShowEditModel(false)}
        tasktoEdit={task}
        onSave={() => {
          setShowEditModel(false);
          onRefresh?.();
        }}
        onLogout={onLogout}
      />
    </>
  );
};

export default TaskItem;
