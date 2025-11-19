import React, { useState } from 'react';

export const FilterGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        title="Guide d'utilisation des filtres"
      >
        <i className='bx bx-help-circle text-lg'></i>
        <span className="hidden sm:inline">Guide des filtres</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className='bx bx-filter-alt text-3xl'></i>
                  <div>
                    <h3 className="text-2xl font-bold">Guide des Filtres Avancés</h3>
                    <p className="text-blue-100 text-sm">Trouvez rapidement les élèves que vous cherchez</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className='bx bx-x text-2xl'></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Search Tips */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className='bx bx-search-alt text-blue-600'></i>
                  Recherche par Nom
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">✓</span> Tapez n'importe quelle partie du nom ou prénom
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">✓</span> La recherche est insensible à la casse
                  </p>
                  <div className="bg-white p-2 rounded border border-gray-200 mt-2">
                    <p className="text-xs text-gray-500 mb-1">Exemples:</p>
                    <code className="text-xs text-blue-600">sanogo</code> → Trouve "Sanogo Adamo"<br/>
                    <code className="text-xs text-blue-600">adam</code> → Trouve "Adamo", "Adam", etc.
                  </div>
                </div>
              </div>

              {/* Filter Combinations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className='bx bx-filter text-purple-600'></i>
                  Combinaison de Filtres
                </h4>
                <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-gray-800">Filtrez par Classe</p>
                      <p className="text-sm text-gray-600">Voir tous les élèves d'une classe spécifique</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-gray-800">Ajoutez le Professeur</p>
                      <p className="text-sm text-gray-600">Combinez avec un professeur pour voir ses élèves</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-gray-800">Affinez par Statut</p>
                      <p className="text-sm text-gray-600">Ne voir que les élèves actifs, en attente, etc.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Examples */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <i className='bx bx-bulb text-amber-600'></i>
                  Exemples Pratiques
                </h4>
                <div className="space-y-2">
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm font-medium text-green-800">Tous les garçons de CM2</p>
                    <p className="text-xs text-green-600 mt-1">Classe: CM2 + Genre: Masculin</p>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-sm font-medium text-blue-800">Élèves en attente d'inscription</p>
                    <p className="text-xs text-blue-600 mt-1">Statut: En attente</p>
                  </div>
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded">
                    <p className="text-sm font-medium text-indigo-800">Nouveaux inscrits ce mois</p>
                    <p className="text-xs text-indigo-600 mt-1">Date d'inscription: Premier jour du mois → Aujourd'hui</p>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                    <p className="text-sm font-medium text-amber-800">Élèves d'un professeur spécifique</p>
                    <p className="text-xs text-amber-600 mt-1">Professeur: Sélectionnez le nom du professeur</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <i className='bx bx-info-circle'></i>
                  Astuces
                </h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Les filtres actifs s'affichent sous forme de badges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Cliquez sur le X dans un badge pour retirer ce filtre rapidement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Le bouton "Réinitialiser" efface tous les filtres d'un coup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>L'export CSV exporte uniquement les élèves filtrés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Le compteur de résultats montre combien d'élèves correspondent à vos critères</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
