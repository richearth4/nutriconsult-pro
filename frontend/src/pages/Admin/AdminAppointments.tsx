import { Calendar as CalendarIcon, Clock, Video, Users } from 'lucide-react';

const AdminAppointments = () => {
  const appointments = [
    { id: 1, client: 'Test Client', date: 'Today', time: '2:00 PM', type: 'Initial Intake', status: 'Pending' },
    { id: 2, client: 'Sarah Jenkins', date: 'Tomorrow', time: '11:00 AM', type: 'Weekly Check-in', status: 'Confirmed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>Master Schedule</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your client appointments and availability.</p>
      </header>

      <div className="glass-panel">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={20} color="var(--accent-primary)" /> Upcoming Consultations
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map(app => (
            <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="var(--text-secondary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{app.client}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CalendarIcon size={14} /> {app.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {app.time}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1rem', fontSize: '0.85rem', color: app.status === 'Pending' ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                  {app.status}
                </span>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <Video size={16} /> Start Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
