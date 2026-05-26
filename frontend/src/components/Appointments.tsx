import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, CheckCircle } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState<any[]>([
    { id: '1', date: '2026-05-12', time: '10:00 AM', type: 'Initial Consultation', status: 'Confirmed' }
  ]);
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBook = () => {
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      const newApp = {
        id: Date.now().toString(),
        date: '2026-05-15',
        time: '02:00 PM',
        type: 'Nutrition Follow-up',
        status: 'Scheduled'
      };
      setAppointments([newApp, ...appointments]);
      setIsBooking(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>My Appointments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your upcoming consultations.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleBook}
          disabled={isBooking}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isBooking ? 0.7 : 1 }}
        >
          {isBooking ? 'Booking...' : <><CalendarIcon size={18} /> Book New Session</>}
        </button>
      </header>

      {showSuccess && (
        <div style={{ backgroundColor: 'var(--accent-success)', color: 'white', padding: '0.75rem 1rem', borderRadius: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fade-in 0.3s' }}>
          <CheckCircle size={18} /> Appointment booked successfully!
        </div>
      )}

      <div className="glass-panel">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Upcoming Sessions</h2>
        {appointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map(app => (
              <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.35rem', border: '1px solid var(--border-light)', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <CalendarIcon size={14} /> {app.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Clock size={14} /> {app.time}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>{app.type}</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1rem', color: 'var(--accent-success)' }}>
                      {app.status}
                    </span>
                  </div>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                  <Video size={14} /> Join Room
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upcoming appointments scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default Appointments;
