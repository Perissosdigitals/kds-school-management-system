// Test du mapping des rôles
const backendUser = {
  id: "18a09cde-ea72-4a0f-956c-949ca4ac4dc0",
  email: "fondatrice@kds-school.com",
  role: "fondatrice",
  firstName: "Madame",
  lastName: "Fondatrice"
};

const roleMap = {
  'fondatrice': 'Fondatrice',
  'directrice': 'Directrice',
  'comptable': 'Comptable',
  'gestionnaire': 'Gestionnaire',
  'agent': 'Agent Administratif',
  'enseignant': 'Enseignant'
};

const mappedRole = roleMap[backendUser.role.toLowerCase()] || 'Agent Administratif';
const mappedUser = {
  id: backendUser.id,
  name: `${backendUser.firstName} ${backendUser.lastName}`,
  role: mappedRole,
  avatar: `${backendUser.firstName?.charAt(0) || ''}${backendUser.lastName?.charAt(0) || ''}`
};

console.log('Backend User:', JSON.stringify(backendUser, null, 2));
console.log('\nMapped User:', JSON.stringify(mappedUser, null, 2));
console.log('\nRole mapped correctly:', mappedRole === 'Fondatrice' ? '✅' : '❌');
