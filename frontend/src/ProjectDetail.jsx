import { useEffect, useState } from 'react';
import API from './api';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', priority:'MEDIUM', dueDate:'', assigneeId:'' });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { ...form, projectId: parseInt(id), assigneeId: form.assigneeId || null });
      toast.success('Task created!');
      setShowForm(false);
      setForm({ title:'', description:'', priority:'MEDIUM', dueDate:'', assigneeId:'' });
      fetchTasks();
    } catch { toast.error('Failed to create task'); }
  };

  const updateStatus = async (taskId, status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await API.put(`/tasks/${taskId}`, { ...task, status, projectId: parseInt(id) });
      fetchTasks();
    } catch { toast.error('Failed to update'); }
  };

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Failed to delete'); }
  };

  const statusColor = (s) => ({ TODO:'#f59e0b', IN_PROGRESS:'#3b82f6', DONE:'#10b981' }[s] || '#666');
  const priorityColor = (p) => ({ LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#ef4444' }[p] || '#666');

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        <h2 style={{color:'white', margin:0}}>📁 Project Tasks</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>+ Add Task</button>
      </div>

      <div style={styles.content}>
        {showForm && (
          <div style={styles.formCard}>
            <h3>New Task</h3>
            <form onSubmit={createTask}>
              <input style={styles.input} placeholder="Task title"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <input style={styles.input} placeholder="Description"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <select style={styles.input} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <input style={styles.input} type="datetime-local"
                value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              <input style={styles.input} placeholder="Assignee ID (optional)"
                value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})} />
              <button style={styles.addBtn} type="submit">Create Task</button>
            </form>
          </div>
        )}

        <div style={styles.columns}>
          {['TODO','IN_PROGRESS','DONE'].map(status => (
            <div key={status} style={styles.column}>
              <h3 style={styles.colHeader}>{status.replace('_',' ')}</h3>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} style={styles.taskCard}>
                  <h4 style={{margin:'0 0 0.5rem'}}>{task.title}</h4>
                  <p style={{color:'#666', fontSize:'13px', margin:'0 0 0.5rem'}}>{task.description}</p>
                  <span style={{...styles.badge, background: priorityColor(task.priority)}}>{task.priority}</span>
                  {task.dueDate && <p style={{fontSize:'11px', color:'#999', margin:'0.5rem 0 0'}}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  <div style={{display:'flex', gap:'0.4rem', marginTop:'0.75rem', flexWrap:'wrap'}}>
                    {status !== 'TODO' && <button style={styles.smBtn} onClick={() => updateStatus(task.id, 'TODO')}>Todo</button>}
                    {status !== 'IN_PROGRESS' && <button style={{...styles.smBtn, background:'#3b82f6'}} onClick={() => updateStatus(task.id, 'IN_PROGRESS')}>In Progress</button>}
                    {status !== 'DONE' && <button style={{...styles.smBtn, background:'#10b981'}} onClick={() => updateStatus(task.id, 'DONE')}>Done</button>}
                    <button style={{...styles.smBtn, background:'#ef4444'}} onClick={() => deleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#f0f2f5' },
  navbar: { background:'#4f46e5', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
  backBtn: { padding:'0.4rem 1rem', background:'white', color:'#4f46e5', border:'none', borderRadius:'6px', cursor:'pointer' },
  addBtn: { padding:'0.5rem 1rem', background:'white', color:'#4f46e5', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  content: { padding:'2rem', maxWidth:'1100px', margin:'0 auto' },
  formCard: { background:'white', padding:'1.5rem', borderRadius:'12px', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  input: { width:'100%', padding:'0.6rem', marginBottom:'0.75rem', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' },
  columns: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem' },
  column: { background:'white', padding:'1rem', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  colHeader: { textAlign:'center', marginBottom:'1rem', color:'#4f46e5' },
  taskCard: { background:'#f8f9ff', padding:'1rem', borderRadius:'10px', marginBottom:'0.75rem', border:'1px solid #e0e0ff' },
  badge: { padding:'0.2rem 0.6rem', borderRadius:'20px', color:'white', fontSize:'11px' },
  smBtn: { padding:'0.3rem 0.6rem', background:'#4f46e5', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
};
