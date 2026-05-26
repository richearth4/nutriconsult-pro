import { useState } from 'react';
import { Heart, Search, Clock, Flame, ChevronRight, X } from 'lucide-react';

const NaijaRecipes = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const recipes = [
    { 
      title: 'Air-Fried Plantain (Dodo)', 
      calories: '150 kcal', 
      time: '15 mins', 
      img: '🍌',
      ingredients: ['2 large ripe plantains', '1 tsp salt (optional)', 'Coconut oil spray'],
      steps: [
        'Peel and slice plantains into diagonal rounds.',
        'Preheat air fryer to 200°C (400°F).',
        'Lightly spray basket and place plantains in a single layer.',
        'Cook for 10-12 mins, flipping halfway until golden brown.'
      ]
    },
    { 
      title: 'Oatmeal Fufu & Efo Riro', 
      calories: '320 kcal', 
      time: '40 mins', 
      img: '🍲',
      ingredients: ['1 cup ground oats', '2 cups spinach (Efo)', 'Smoked fish', 'Pepper mix'],
      steps: [
        'Mix ground oats with boiling water to form a smooth fufu.',
        'Steam spinach and drain excess water.',
        'Sauté pepper mix with smoked fish and locust beans.',
        'Combine spinach and stir well. Serve hot with oat fufu.'
      ]
    },
    { 
      title: 'Oil-less Okra Soup', 
      calories: '210 kcal', 
      time: '25 mins', 
      img: '🥣',
      ingredients: ['Chopped okra', 'Ugu leaves', 'Shrimp', 'Stock fish', 'Seasoning'],
      steps: [
        'Boil stock fish until tender.',
        'Add shrimp and okra to the boiling stock.',
        'Whisk until it draws (thickens).',
        'Add Ugu leaves and simmer for 2 minutes.'
      ]
    },
    { title: 'Grilled Chicken Suya', calories: '280 kcal', time: '35 mins', img: '🍢' },
    { title: 'Unripe Plantain Porridge', calories: '350 kcal', time: '45 mins', img: '🥘' },
    { title: 'Moi Moi (Baked, No Oil)', calories: '180 kcal', time: '50 mins', img: '🥟' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>Recipes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover low-calorie, heart-healthy versions of your favorite Nigerian meals.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="Search recipes..." style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '2rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', width: '250px' }} />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {recipes.map((recipe, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' }} onClick={() => setSelectedRecipe(recipe)}>
            <div style={{ height: '140px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              {recipe.img}
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{recipe.title}</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); }}>
                  <Heart size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Flame size={14} /> {recipe.calories}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {recipe.time}</span>
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                View Recipe <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2.5rem' }}>
            <button onClick={() => setSelectedRecipe(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
               <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{selectedRecipe.img}</div>
               <h2 style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>{selectedRecipe.title}</h2>
               <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--text-secondary)' }}>
                 <span>🔥 {selectedRecipe.calories}</span>
                 <span>⏱️ {selectedRecipe.time}</span>
               </div>
            </div>

            {selectedRecipe.ingredients ? (
              <>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Ingredients</h3>
                <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {selectedRecipe.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                </ul>

                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Preparation</h3>
                <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {selectedRecipe.steps.map((step: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{step}</li>)}
                </ol>
              </>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                Full recipe details are being updated. Check back soon!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NaijaRecipes;
