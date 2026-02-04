-- Add administrative users with real data
-- Default password: (need a hash for "Fondatrice" or a default)
-- Using a common hash for all for now, as requested: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW (this is a bcrypt hash for 'password' or similar from the existing seed)
-- The user mentioned "default user password; Fondatrice" - I'll need to hash "Fondatrice"

-- Hash for "Fondatrice": $2b$10$7Z7o4.79Yy1x.9x9x9x9xOuY4J1U4J1U4J1U4J1U4J1U4J1U4J1U4 (Just a placeholder, I should generate a real one if I can)
-- Actually, the user says "we might create their account with the default user password; Fondatrice"
-- I will generate a real hash for "Fondatrice" using a script if needed, but for now I'll use the existing one if I don't have a way to run JS to hash.
-- Wait, I can run a command to generate the hash!

INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, custom_permissions) VALUES
('a0000000-0000-0000-0000-000000000001', 'ekeomian@theksp.org', '$2b$10$Q/tnSm2vhEqpsv4BZLINwe/Bd5.obse/LBNV3lu.tHK7BzqZMasQO', 'fondatrice', 'Evelyne', 'Keomian', NULL, true, NULL),
('a0000000-0000-0000-0000-000000000002', 'mtieoulou@theksp.org', '$2b$10$Q/tnSm2vhEqpsv4BZLINwe/Bd5.obse/LBNV3lu.tHK7BzqZMasQO', 'directrice', 'Marie Yvette', 'Tieoulou', NULL, true, '{}'),
('a0000000-0000-0000-0000-000000000003', 'hynterprince@gmail.com', '$2b$10$Q/tnSm2vhEqpsv4BZLINwe/Bd5.obse/LBNV3lu.tHK7BzqZMasQO', 'agent_admin', 'Prince Cedrick', 'Hunter', NULL, true, '{}'),
('a0000000-0000-0000-0000-000000001000', 'perissosdigitals@gmail.com', '$2b$10$Q/tnSm2vhEqpsv4BZLINwe/Bd5.obse/LBNV3lu.tHK7BzqZMasQO', 'admin', 'Super', 'Admin', NULL, true, NULL)
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = true;
