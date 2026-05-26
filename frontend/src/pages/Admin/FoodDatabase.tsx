import { useState } from 'react';
import { Database, Plus, Search, Edit, Trash2 } from 'lucide-react';

const FoodDatabase = () => {
  const [foods] = useState([
    { id: 1, name: 'Amala (Yam Flour)', portion: '1 wrap (medium)', calories: 350, macros: 'C: 85g, P: 4g, F: 0g' },
    { id: 2, name: 'Egusi Soup (with Palm Oil)', portion: '2 serving spoons', calories: 420, macros: 'C: 12g, P: 18g, F: 35g' },
    { id: 3, name: 'Jollof Rice (Parboiled)', portion: '1 serving spoon', calories: 250, macros: 'C: 45g, P: 5g, F: 6g' },
    { id: 4, name: 'Moi Moi (Steamed Bean Pudding)', portion: '1 wrap', calories: 180, macros: 'C: 22g, P: 12g, F: 6g' },
    { id: 5, name: 'Roasted Plantain (Boli)', portion: '1 medium', calories: 220, macros: 'C: 55g, P: 2g, F: 0g' }
  ]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={28} color="var(--accent-primary)" /> Proprietary Food Database
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage accurate macros and cultural portion sizes for Nigerian foods.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search foods..." style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '2rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', width: '250px' }} />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Food
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Food Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Cultural Portion</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Calories</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Macros (C/P/F)</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map(food => (
              <tr key={food.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{food.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{food.portion}</td>
                <td style={{ padding: '1rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{food.calories} kcal</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{food.macros}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '1rem' }}>
                    <Edit size={16} />
                  </button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>
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
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add Local Food</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Food Name (e.g. Ofada Rice)</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cultural Portion (e.g. 1 wrap, 2 spoons)</label>
                <input required type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Calories</label>
                  <input required type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Carbs (g)</label>
                  <input required type="number" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Food</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDatabase;
