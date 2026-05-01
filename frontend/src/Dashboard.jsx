import { useEffect, useState } from 'react';
import API from './api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [newProject, setNewProject] = useState({ name:'', description:'' });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [p, t, o] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks/my'),
        API.get('/tasks/overdue'),
      ]);
      setProjects(p.data);
      setMyTasks(t.data);
      setOverdue(o.data);
    } catch { toast.error('Failed to load data'); }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', newProject);
      toast.success('Project created!');
      setShowForm(false);
      setNewProject({ name:'', description:'' });
      fetchAll();
    } catch { toast.error('Failed to create project'); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const statusColor = (s) => ({ TODO:'#f59e0b', IN_PROGRESS:'#3b82f6', DONE:'#10b981' }[s] || '#666');

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <h2 style={{color:'white', margin:0}}>🗂 Task Manager</h2>
        <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
          <span style={{color:'white'}}>👤 {user.name} ({user.role})</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.stat}><h3>{projects.length}</h3><p>Projects</p></div>
          <div style={styles.stat}><h3>{myTasks.length}</h3><p>My Tasks</p></div>
          <div style={styles.stat}><h3>{myTasks.filter(t=>t.status==='DONE').length}</h3><p>Completed</p></div>
          <div style={{...styles.stat, background:'#fee2e2'}}><h3 style={{color:'#ef4444'}}>{overdue.length}</h3><p>Overdue</p></div>
        </div>

        {/* Projects */}
        <div style={styles.section}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>📁 Projects</h3>
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>+ New Project</button>
          </div>

          {showForm && (
            <form onSubmit={createProject} style={styles.form}>
              <input style={styles.input} placeholder="Project name"
                value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
              <input style={styles.input} placeholder="Description"
                value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              <button style={styles.addBtn} type="submit">Create</button>
            </form>
          )}

          <div style={styles.grid}>
            {projects.map(p => (
              <div key={p.id} style={styles.card} onClick={() => navigate(`/project/${p.id}`)}>
                <h4 style={{margin:'0 0 0.5rem'}}>{p.name}</h4>
                <p style={{color:'#666', fontSize:'13px', margin:0}}>{p.description || 'No description'}</p>
                <p style={{color:'#4f46e5', fontSize:'12px', marginTop:'0.5rem'}}>👥 {p.members?.length || 0} members</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Tasks */}
        <div style={styles.section}>
          <h3>✅ My Tasks</h3>
          {myTasks.length === 0 && <p style={{color:'#999'}}>No tasks assigned to you</p>}
          {myTasks.map(t => (
            <div key={t.id} style={styles.taskRow}>
              <span>{t.title}</span>
              <span style={{...styles.badge, background: statusColor(t.status)}}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div style={styles.section}>
            <h3 style={{color:'#ef4444'}}>⚠️ Overdue Tasks</h3>
            {overdue.map(t => (
              <div key={t.id} style={{...styles.taskRow, background:'#fee2e2'}}>
                <span>{t.title}</span>
                <span style={{fontSize:'12px', color:'#ef4444'}}>{t.project?.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#f0f2f5' },
  navbar: { background:'#4f46e5', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
  logoutBtn: { padding:'0.4rem 1rem', background:'white', color:'#4f46e5', border:'none', borderRadius:'6px', cursor:'pointer' },
  content: { padding:'2rem', maxWidth:'1100px', margin:'0 auto' },
  statsRow: { display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap' },
  stat: { background:'white', padding:'1.5rem', borderRadius:'12px', flex:1, minWidth:'150px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  section: { background:'white', padding:'1.5rem', borderRadius:'12px', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'1rem', marginTop:'1rem' },
  card: { background:'#f8f9ff', padding:'1rem', borderRadius:'10px', cursor:'pointer', border:'1px solid #e0e0ff', transition:'transform 0.2s' },
  form: { display:'flex', gap:'0.5rem', margin:'1rem 0', flexWrap:'wrap' },
  input: { padding:'0.5rem', borderRadius:'6px', border:'1px solid #ddd', flex:1, minWidth:'150px' },
  addBtn: { padding:'0.5rem 1rem', background:'#4f46e5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' },
  taskRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem', background:'#f8f9ff', borderRadius:'8px', marginBottom:'0.5rem' },
  badge: { padding:'0.25rem 0.75rem', borderRadius:'20px', color:'white', fontSize:'12px' },
};
