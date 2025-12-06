
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar as CalendarIcon, CheckSquare, Plus, Clock, Users, Bell, Trash2, X } from 'lucide-react';
import { Task } from '../types';

const CalendarPage = () => {
  const { t, tasks, addTask, updateTask, deleteTask, currentUser, users, students } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ 
      type: 'todo', 
      reminder: false, 
      assignedTo: [], 
      dueDate: new Date().toISOString() 
  });
  
  // Tab State for Task List
  const [listTab, setListTab] = useState<'my' | 'assigned'>('my');

  // Helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Tasks Filtered for Calendar
  const getTasksForDate = (day: number) => {
      return tasks.filter(t => {
          const d = new Date(t.dueDate);
          return d.getDate() === day && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      });
  };

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(newTask.title) {
          addTask({
              id: Date.now().toString(),
              title: newTask.title,
              type: newTask.type as any,
              status: 'pending',
              dueDate: newTask.dueDate!,
              reminder: newTask.reminder!,
              reminderDate: newTask.reminderDate, // New Field
              assignedTo: newTask.assignedTo!,
              createdBy: currentUser?.id || 'sys'
          });
          setShowAddModal(false);
          setNewTask({ type: 'todo', reminder: false, assignedTo: [], dueDate: new Date().toISOString() });
      }
  };

  const toggleTask = (t: Task) => {
      updateTask({ ...t, status: t.status === 'pending' ? 'completed' : 'pending' });
  };

  const myTasks = tasks.filter(t => t.assignedTo.includes(currentUser?.id || '') || t.createdBy === currentUser?.id);
  const assignedTasks = tasks.filter(t => t.type === 'task' && t.createdBy === currentUser?.id);

  const displayTasks = listTab === 'my' ? myTasks : assignedTasks;

  return (
    <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <CalendarIcon size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">{t('calendar')}</h2>
                <p className="text-xs text-slate-500">Manage schedule and daily tasks.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Calendar View */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} className="text-blue-500"/> 
                        {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth()-1)))} className="p-1 hover:bg-slate-100 rounded text-slate-600">Prev</button>
                        <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth()+1)))} className="p-1 hover:bg-slate-100 rounded text-slate-600">Next</button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: getFirstDayOfMonth(selectedDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: getDaysInMonth(selectedDate) }).map((_, i) => {
                        const day = i + 1;
                        const dayTasks = getTasksForDate(day);
                        const isToday = day === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth();
                        
                        return (
                            <div 
                                key={day} 
                                onClick={() => { 
                                    const d = new Date(selectedDate); d.setDate(day); 
                                    setNewTask({...newTask, dueDate: d.toISOString().split('T')[0]}); 
                                    setShowAddModal(true); 
                                }}
                                className={`
                                    aspect-square rounded-xl flex flex-col items-center justify-start pt-2 text-sm font-medium border relative cursor-pointer transition
                                    hover:border-blue-300 hover:shadow-md
                                    ${dayTasks.length > 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-transparent border-transparent'}
                                    ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                `}
                            >
                                <span className={isToday ? 'text-blue-600 font-bold' : 'text-slate-700'}>{day}</span>
                                <div className="flex gap-1 mt-1 flex-wrap justify-center px-1">
                                    {dayTasks.slice(0, 4).map(t => (
                                        <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.type === 'todo' ? 'bg-green-500' : 'bg-purple-500'}`} title={t.title}></div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Task List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare size={16} className="text-green-500"/> Tasks
                    </h3>
                    <button onClick={() => setShowAddModal(true)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"><Plus size={16}/></button>
                </div>

                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-4">
                    <button onClick={() => setListTab('my')} className={`flex-1 py-1 text-xs font-bold rounded ${listTab === 'my' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t('myTasks')}</button>
                    <button onClick={() => setListTab('assigned')} className={`flex-1 py-1 text-xs font-bold rounded ${listTab === 'assigned' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{t('assignedTasks')}</button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                    {displayTasks.length === 0 ? <p className="text-center text-slate-400 text-xs py-4">No tasks found.</p> : displayTasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`p-3 rounded-xl border flex items-center gap-3 transition select-none group
                                ${task.status === 'completed' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}
                            `}
                        >
                            <div onClick={() => toggleTask(task)} className={`w-5 h-5 rounded-md flex items-center justify-center border cursor-pointer transition ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                {task.status === 'completed' && <CheckSquare size={12}/>}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${task.type === 'todo' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{task.type}</span>
                                    {task.reminder && <Bell size={10} className="text-orange-500"/>}
                                    <span className="text-[10px] text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded transition"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-lg text-slate-800">{t('addTask')}</h3>
                        <button onClick={() => setShowAddModal(false)}><X size={20} className="text-slate-400"/></button>
                    </div>
                    <form onSubmit={handleAddTask} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Title</label>
                            <input required className="w-full border rounded-lg px-3 py-2 text-sm" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="What needs to be done?" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('type')}</label>
                                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value as any})}>
                                    <option value="todo">Personal Todo</option>
                                    <option value="task">Assigned Task</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('dueDate')}</label>
                                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                            </div>
                        </div>
                        
                        {newTask.type === 'task' && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{t('assignedTo')}</label>
                                <select multiple className="w-full border rounded-lg px-3 py-2 text-sm h-24" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: Array.from(e.target.selectedOptions, option => option.value)})}>
                                    <optgroup label="Users">
                                        {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                                    </optgroup>
                                    <optgroup label="Students">
                                        {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                                    </optgroup>
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="reminder" checked={newTask.reminder} onChange={e => setNewTask({...newTask, reminder: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="reminder" className="text-sm font-medium text-slate-700">{t('reminder')}</label>
                            </div>
                            {newTask.reminder && (
                                <input 
                                    type="datetime-local" 
                                    className="w-full border rounded-lg px-3 py-2 text-sm animate-in fade-in slide-in-from-top-1" 
                                    value={newTask.reminderDate} 
                                    onChange={e => setNewTask({...newTask, reminderDate: e.target.value})} 
                                />
                            )}
                        </div>

                        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition">{t('add')}</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default CalendarPage;
