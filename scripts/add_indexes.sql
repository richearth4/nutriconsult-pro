-- Performance Indexes for NutriConsult Pro
-- Run this script to add indexes for improved query performance

-- Index on users.email for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on client_data.user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_client_data_user_id ON client_data(user_id);

-- Composite index on weight_history for user weight tracking queries
CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON weight_history(user_id, date DESC);

-- Index on appointments for client appointment queries
CREATE INDEX IF NOT EXISTS idx_appointments_client_date ON appointments(client_id, appointment_date DESC);

-- Index on consultation_notes for faster note retrieval
CREATE INDEX IF NOT EXISTS idx_consultation_notes_user ON consultation_notes(user_id, updated_at DESC);

-- Index on resource_assignments for faster resource lookups
CREATE INDEX IF NOT EXISTS idx_resource_assignments_user ON resource_assignments(user_id);

-- Index on meal_plans for faster plan retrieval
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id);

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE client_data;
ANALYZE weight_history;
ANALYZE appointments;
ANALYZE consultation_notes;
ANALYZE resource_assignments;
ANALYZE meal_plans;

-- Display index information
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
