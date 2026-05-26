import { useState } from 'react';
import { Edit, Trash2, Plus, Shield } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Test Client', email: 'client@example.com', role: 'Client', status: 'Active' },
    { id: 2, name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'Client', status: 'Active' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Client' });

  const handleDelete = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, { id: Date.now(), name: newUser.name, email: newUser.email, role: newUser.role, status: 'Active' }]);
    setShowModal(false);
    setNewUser({ name: '', email: '', role: 'Client' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={28} color="var(--accent-primary)" /> Access Control & Users
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage client and staff accounts across the platform.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New User
        </button>
      </header>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', backgroundColor: u.role === 'Admin' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: u.role === 'Admin' ? 'white' : 'var(--text-primary)' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--accent-success)' }}>{u.status}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '1rem' }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', backgroundColor: 'var(--bg-primary)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add New User</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                  <option value="Client">Client</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
