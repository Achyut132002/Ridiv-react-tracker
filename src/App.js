import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const Task = ({ task, index, moveTask, toggleTaskCompletion, deleteTask, editTask }) => {
  const [, ref] = useDrag({
    type: 'TASK',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTaskName(task.name);
  };

  const handleSaveEdit = () => {
    if (editedTaskName.trim() !== '') {
      editTask(task.id, editedTaskName);
      setIsEditing(false);
    }
  };

  return (
    <li ref={(node) => ref(drop(node))} key={task.id} className={`${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTaskName}
            onChange={(e) => setEditedTaskName(e.target.value)}
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </>
      ) : (
        <>
          <span>{task.name}</span>
          <span>{task.dateAdded}</span>
          <button onClick={() => toggleTaskCompletion(task.id)}>
            {task.completed ? 'Undo' : 'Complete'}
          </button>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
          <button onClick={handleEditClick}>Edit</button>
        </>
      )}
    </li>
  );
};

const TaskTracker = () => {
  const initialTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskName, setNewTaskName] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTaskName.trim() !== '') {
      const newTask = {
        id: new Date().getTime(),
        name: newTaskName,
        dateAdded: new Date().toLocaleString(),
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskName('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const moveTask = (fromIndex, toIndex) => {
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedTask);
    setTasks(updatedTasks);
  };

  const editTask = (taskId, newName) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, name: newName } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <div className="task-tracker">
      <h1>React Task Tracker</h1>
      <div className="input-box">
        <input
          type="text"
          placeholder="Add a new task"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={addTask}>Add Task</button>
        <span className='checkbx'>
        
          Completed
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          <span className="slider"></span>
        
        </span>
      </div>
      <DndProvider backend={HTML5Backend}>
        <ul>
          {tasks
            .filter((task) => (showCompleted ? true : !task.completed))
            .map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                moveTask={moveTask}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTask}
                editTask={editTask}
              />
            ))}
        </ul>
      </DndProvider>
    </div>
  );
};

export default TaskTracker;
