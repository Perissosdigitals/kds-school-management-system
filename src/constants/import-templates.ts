export const IMPORT_TEMPLATES = {
  students: [
    'ID',
    'Nom',
    'Prénom',
    'Date Naissance',
    'Sexe',
    'Classe',
    'Contact Urgence',
    'Téléphone',
    'Adresse',
    'Info Médicale',
    'Statut'
  ],
  teachers: [
    'ID_Prof',
    'Nom',
    'Prenom',
    'Matiere',
    'Tel',
    'Email',
    'Classes_Assignees'
  ],
  classes: [
    'ID_Classe',
    'Niveau',
    'Nom_Classe',
    'Prof_Principal',
    'Salle',
    'Effectif_Max',
    'Effectif_Actuel'
  ],
  grades: [
    'ID_Eleve',
    'Nom_Eleve',
    'Classe',
    'Trimestre',
    'Francais',
    'Mathematiques',
    'Histoire_Geo',
    'Sciences',
    'Anglais',
    'Sport',
    'Arts',
    'Moyenne'
  ],
  enrollments: [
    'ID_Inscription',
    'ID_Eleve',
    'Nom_Eleve',
    'Classe_Demandee',
    'Date_Demande',
    'Statut',
    'Certificat_Naissance',
    'Carnet_Vaccin',
    'Justif_Domicile',
    'Photos',
    'Date_Validation',
    'Remarques'
  ]
};

export const DATA_TYPES = [
  { value: 'students', label: 'Élèves', icon: '👨‍🎓', desc: 'Liste complète des élèves' },
  { value: 'teachers', label: 'Professeurs', icon: '👨‍🏫', desc: 'Corps enseignant' },
  { value: 'classes', label: 'Classes', icon: '🏫', desc: 'Structure des classes' },
  { value: 'grades', label: 'Notes', icon: '📊', desc: 'Relevés de notes' },
  { value: 'enrollments', label: 'Inscriptions', icon: '📝', desc: 'Dossiers d\'inscription' }
];
