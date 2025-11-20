import React, { useState, useMemo } from 'react';
import type { User, Activity, Event, Meeting, Incident, Association, Announcement, Teacher, Student } from '../types';
import { ActivityForm, EventForm, MeetingForm, IncidentForm, AssociationForm, AnnouncementForm } from './forms';
import { Modal } from './Modal';

type ActiveTab = 'dashboard' | 'activities' | 'events' | 'meetings' | 'discipline' | 'associations' | 'announcements';

// Types imported from types.ts

const TabButton = React.memo<{ active: boolean; onClick: () => void; icon: string; label: string; count?: number }>(
    ({ active, onClick, icon, label, count }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                active
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            <i className={`bx ${icon} text-xl`}></i>
            <span>{label}</span>
            {count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    )
);

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string; trend?: string }> = 
    ({ icon, label, value, color, trend }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                    <i className={`bx ${icon} text-2xl ${color}`}></i>
                </div>
                {trend && (
                    <span className="text-xs text-green-600 font-medium">
                        <i className='bx bx-trending-up'></i> {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );

export const SchoolLife: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [showAssociationModal, setShowAssociationModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

    // Mock data for forms
    const mockTeachers: Teacher[] = [];
    const mockStudents: Student[] = [];

    // Données mock - à remplacer par des appels API
    const mockActivities: Activity[] = [
        { id: '1', name: 'Club de Football', type: 'club', category: 'Sport', supervisor: 'M. Koné', schedule: 'Mercredi 15h-17h', participants: 24, maxCapacity: 30, status: 'active' },
        { id: '2', name: 'Atelier de Lecture Torah', type: 'atelier', category: 'Religieux', supervisor: 'Mme Fondatrice', schedule: 'Jeudi 16h-18h', participants: 18, maxCapacity: 25, status: 'active' },
        { id: '3', name: 'Club Informatique', type: 'club', category: 'Technologie', supervisor: 'M. Traoré', schedule: 'Vendredi 14h-16h', participants: 15, maxCapacity: 20, status: 'active' },
        { id: '4', name: 'Visite Musée National', type: 'sortie', category: 'Culturel', supervisor: 'Mme Coulibaly', schedule: '25 Nov 2025', participants: 45, maxCapacity: 50, status: 'planned' },
    ];

    const mockEvents: Event[] = [
        { id: '1', title: 'Cérémonie de Hanoucca', type: 'ceremonie', date: '2025-12-15', time: '10:00', location: 'Auditorium', organizer: 'Direction', participants: 150, status: 'upcoming' },
        { id: '2', title: 'Journée Culturelle Ivoirienne', type: 'journee_thematique', date: '2025-12-01', time: '09:00', location: 'Cour Principale', organizer: 'Vie Scolaire', participants: 200, status: 'upcoming' },
        { id: '3', title: 'Tournoi Inter-Classes Football', type: 'competition', date: '2025-11-28', time: '14:00', location: 'Terrain de Sport', organizer: 'Club Sport', participants: 80, status: 'upcoming' },
    ];

    const mockMeetings: Meeting[] = [
        { id: '1', title: 'Réunion Parents CM2', type: 'parents_professeurs', date: '2025-11-25', time: '17:00', location: 'Salle A-101', organizer: 'M. Traoré', invitations: 30, confirmations: 22 },
        { id: '2', title: 'Conseil de Classe 6ème', type: 'conseil_classe', date: '2025-11-27', time: '14:00', location: 'Salle des Profs', organizer: 'Direction', invitations: 8, confirmations: 8 },
    ];

    const mockDiscipline: DisciplineRecord[] = [
        { id: '1', studentName: 'Jean KOUASSI', studentCode: 'KDS24001', date: '2025-11-18', type: 'encouragement', category: 'Comportement exemplaire', description: 'A aidé un camarade en difficulté', followUp: 'Félicitations écrites', severity: 'low' },
        { id: '2', studentName: 'Moussa BAMBA', studentCode: 'KDS24003', date: '2025-11-19', type: 'incident', category: 'Retard répété', description: 'Troisième retard cette semaine', followUp: 'Entretien avec parents', severity: 'medium' },
    ];

    const mockAssociations: Association[] = [
        { id: '1', name: 'Association des Élèves', type: 'etudiant', president: 'Aminata Touré', members: 45, budget: 500000, projects: 3, status: 'active' },
        { id: '2', name: 'Club Solidarité', type: 'solidaire', president: 'David N\'Guessan', members: 28, budget: 300000, projects: 2, status: 'active' },
    ];

    const stats = useMemo(() => ({
        totalActivities: mockActivities.filter(a => a.status === 'active').length,
        totalParticipants: mockActivities.reduce((sum, a) => sum + a.participants, 0),
        upcomingEvents: mockEvents.filter(e => e.status === 'upcoming').length,
        pendingMeetings: mockMeetings.length,
        disciplineRecords: mockDiscipline.filter(d => d.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).length,
        activeAssociations: mockAssociations.filter(a => a.status === 'active').length,
    }), []);

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon="bx-group" label="Activités actives" value={stats.totalActivities} color="text-blue-600" trend="+2 ce mois" />
                <StatCard icon="bx-calendar-event" label="Événements à venir" value={stats.upcomingEvents} color="text-purple-600" />
                <StatCard icon="bx-user-voice" label="Réunions programmées" value={stats.pendingMeetings} color="text-orange-600" />
                <StatCard icon="bx-shield" label="Suivis cette semaine" value={stats.disciplineRecords} color="text-red-600" />
                <StatCard icon="bx-building" label="Associations actives" value={stats.activeAssociations} color="text-green-600" />
                <StatCard icon="bx-user-plus" label="Participants totaux" value={stats.totalParticipants} color="text-indigo-600" trend="+15%" />
            </div>

            {/* Calendrier et Annonces */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prochains événements */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            <i className='bx bx-calendar-star mr-2 text-purple-600'></i>
                            Prochains Événements
                        </h3>
                        <button 
                            onClick={() => setActiveTab('events')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Voir tout →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {mockEvents.slice(0, 3).map(event => (
                            <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className='bx bx-calendar text-purple-600 text-xl'></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(event.date).toLocaleDateString('fr-FR')} • {event.time}
                                    </p>
                                    <p className="text-xs text-gray-500">{event.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Annonces importantes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            <i className='bx bx-bell mr-2 text-orange-600'></i>
                            Annonces Importantes
                        </h3>
                        <button 
                            onClick={() => setShowAnnouncementModal(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <i className='bx bx-plus'></i>
                            Nouvelle
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                            <p className="font-medium text-gray-900 mb-1">Inscriptions Club Sport</p>
                            <p className="text-sm text-gray-600">Les inscriptions pour le tournoi inter-classes sont ouvertes jusqu'au 25 novembre.</p>
                            <p className="text-xs text-gray-500 mt-2">Il y a 2 heures</p>
                        </div>
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <p className="font-medium text-gray-900 mb-1">Réunion Parents</p>
                            <p className="text-sm text-gray-600">Convocation pour les parents de CM2 le 25 novembre à 17h.</p>
                            <p className="text-xs text-gray-500 mt-2">Hier</p>
                        </div>
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <p className="font-medium text-gray-900 mb-1">Journée Culturelle</p>
                            <p className="text-sm text-gray-600">Préparez vos costumes traditionnels pour le 1er décembre!</p>
                            <p className="text-xs text-gray-500 mt-2">Il y a 3 jours</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActivities = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Activités Extrascolaires</h3>
                    <p className="text-gray-600">Clubs, ateliers et sorties pédagogiques</p>
                </div>
                <button 
                    onClick={() => setShowActivityModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <i className='bx bx-plus'></i>
                    Nouvelle Activité
                </button>
            </div>

            <div className="flex gap-4 flex-wrap">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                    Tous ({mockActivities.length})
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Clubs ({mockActivities.filter(a => a.type === 'club').length})
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Ateliers ({mockActivities.filter(a => a.type === 'atelier').length})
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Sorties ({mockActivities.filter(a => a.type === 'sortie').length})
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockActivities.map(activity => (
                    <div key={activity.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                activity.type === 'club' ? 'bg-blue-100' :
                                activity.type === 'atelier' ? 'bg-purple-100' : 'bg-green-100'
                            }`}>
                                <i className={`bx text-2xl ${
                                    activity.type === 'club' ? 'bx-trophy text-blue-600' :
                                    activity.type === 'atelier' ? 'bx-palette text-purple-600' : 'bx-trip text-green-600'
                                }`}></i>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                activity.status === 'active' ? 'bg-green-100 text-green-700' :
                                activity.status === 'planned' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {activity.status === 'active' ? 'Actif' : activity.status === 'planned' ? 'Planifié' : 'Terminé'}
                            </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{activity.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{activity.category}</p>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                                <i className='bx bx-user'></i>
                                <span>{activity.supervisor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className='bx bx-time'></i>
                                <span>{activity.schedule}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm">
                                <i className='bx bx-group text-gray-400'></i>
                                <span className="font-medium">{activity.participants}/{activity.maxCapacity}</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Détails →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderEvents = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Événements</h3>
                    <p className="text-gray-600">Cérémonies, journées thématiques et compétitions</p>
                </div>
                <button 
                    onClick={() => setShowEventModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                    <i className='bx bx-plus'></i>
                    Nouvel Événement
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {mockEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-2xl font-bold text-purple-600">
                                    {new Date(event.date).getDate()}
                                </span>
                                <span className="text-xs text-purple-600 uppercase">
                                    {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                        event.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {event.status === 'upcoming' ? 'À venir' : event.status === 'ongoing' ? 'En cours' : 'Terminé'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <i className='bx bx-time-five'></i>
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className='bx bx-map'></i>
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className='bx bx-user'></i>
                                        <span>{event.organizer}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className='bx bx-group'></i>
                                        <span>{event.participants} participants</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                        Gérer
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                                        Participants
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMeetings = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Réunions</h3>
                    <p className="text-gray-600">Parents-professeurs, conseils et assemblées</p>
                </div>
                <button 
                    onClick={() => setShowMeetingModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                    <i className='bx bx-plus'></i>
                    Nouvelle Réunion
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {mockMeetings.map(meeting => (
                    <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <i className='bx bx-user-voice text-orange-600 text-2xl'></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{meeting.title}</h4>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {meeting.type.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-orange-600">
                                {meeting.confirmations}/{meeting.invitations} confirmés
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                                <i className='bx bx-calendar'></i>
                                <span>{new Date(meeting.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className='bx bx-time'></i>
                                <span>{meeting.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className='bx bx-map'></i>
                                <span>{meeting.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className='bx bx-user'></i>
                                <span>{meeting.organizer}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                                Gérer Convocations
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                                Voir Participants
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDiscipline = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Suivi Comportemental</h3>
                    <p className="text-gray-600">Incidents, sanctions et encouragements</p>
                </div>
                <button 
                    onClick={() => setShowIncidentModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                    <i className='bx bx-plus'></i>
                    Nouveau Signalement
                </button>
            </div>

            <div className="flex gap-4 flex-wrap">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Tous ({mockDiscipline.length})
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                    Incidents ({mockDiscipline.filter(d => d.type === 'incident').length})
                </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
                    Sanctions ({mockDiscipline.filter(d => d.type === 'sanction').length})
                </button>
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                    Encouragements ({mockDiscipline.filter(d => d.type === 'encouragement').length})
                </button>
            </div>

            <div className="space-y-4">
                {mockDiscipline.map(record => (
                    <div key={record.id} className={`bg-white rounded-xl border-2 p-6 ${
                        record.type === 'incident' ? 'border-red-200' :
                        record.type === 'sanction' ? 'border-orange-200' : 'border-green-200'
                    }`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    record.type === 'incident' ? 'bg-red-100' :
                                    record.type === 'sanction' ? 'bg-orange-100' : 'bg-green-100'
                                }`}>
                                    <i className={`text-2xl ${
                                        record.type === 'incident' ? 'bx bx-error text-red-600' :
                                        record.type === 'sanction' ? 'bx bx-shield-x text-orange-600' : 'bx bx-trophy text-green-600'
                                    }`}></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">{record.studentName}</h4>
                                    <p className="text-sm text-gray-600">{record.studentCode}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
                                {record.severity && (
                                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                                        record.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        record.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {record.severity === 'high' ? 'Grave' : record.severity === 'medium' ? 'Moyen' : 'Léger'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Catégorie: </span>
                                <span className="text-gray-600">{record.category}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Description: </span>
                                <span className="text-gray-600">{record.description}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Suivi: </span>
                                <span className="text-gray-600">{record.followUp}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                Voir Fiche Élève
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                                Historique
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAssociations = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Associations & Projets</h3>
                    <p className="text-gray-600">Associations étudiantes et projets solidaires</p>
                </div>
                <button 
                    onClick={() => setShowAssociationModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    <i className='bx bx-plus'></i>
                    Nouvelle Association
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockAssociations.map(association => (
                    <div key={association.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                                association.type === 'etudiant' ? 'bg-blue-100' :
                                association.type === 'solidaire' ? 'bg-green-100' : 'bg-purple-100'
                            }`}>
                                <i className={`text-3xl ${
                                    association.type === 'etudiant' ? 'bx bx-group text-blue-600' :
                                    association.type === 'solidaire' ? 'bx bx-heart text-green-600' : 'bx bx-world text-purple-600'
                                }`}></i>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                association.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {association.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">{association.name}</h4>
                        <p className="text-sm text-gray-600 mb-4 capitalize">{association.type}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{association.members}</p>
                                <p className="text-xs text-gray-600">Membres</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{association.projects}</p>
                                <p className="text-xs text-gray-600">Projets</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-4 text-sm">
                            <span className="text-gray-600">Président:</span>
                            <span className="font-medium text-gray-900">{association.president}</span>
                        </div>
                        <div className="flex items-center justify-between mb-4 text-sm">
                            <span className="text-gray-600">Budget:</span>
                            <span className="font-medium text-gray-900">{association.budget.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                Gérer
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                                Projets
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">🏫 Vie Scolaire</h2>
                <p className="text-gray-500">Activités, événements, réunions et vie communautaire</p>
            </div>

            {/* Navigation par onglets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="flex">
                        <TabButton
                            active={activeTab === 'dashboard'}
                            onClick={() => setActiveTab('dashboard')}
                            icon="bx-home"
                            label="Tableau de Bord"
                        />
                        <TabButton
                            active={activeTab === 'activities'}
                            onClick={() => setActiveTab('activities')}
                            icon="bx-group"
                            label="Activités"
                            count={stats.totalActivities}
                        />
                        <TabButton
                            active={activeTab === 'events'}
                            onClick={() => setActiveTab('events')}
                            icon="bx-calendar-event"
                            label="Événements"
                            count={stats.upcomingEvents}
                        />
                        <TabButton
                            active={activeTab === 'meetings'}
                            onClick={() => setActiveTab('meetings')}
                            icon="bx-user-voice"
                            label="Réunions"
                            count={stats.pendingMeetings}
                        />
                        <TabButton
                            active={activeTab === 'discipline'}
                            onClick={() => setActiveTab('discipline')}
                            icon="bx-shield"
                            label="Discipline"
                            count={stats.disciplineRecords}
                        />
                        <TabButton
                            active={activeTab === 'associations'}
                            onClick={() => setActiveTab('associations')}
                            icon="bx-building"
                            label="Associations"
                            count={stats.activeAssociations}
                        />
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'activities' && renderActivities()}
                    {activeTab === 'events' && renderEvents()}
                    {activeTab === 'meetings' && renderMeetings()}
                    {activeTab === 'discipline' && renderDiscipline()}
                    {activeTab === 'associations' && renderAssociations()}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="Nouvelle Activité">
                <ActivityForm
                    teachers={mockTeachers}
                    onSave={(activity) => {
                        console.log('Activité créée:', activity);
                        // TODO: API call to save activity
                        setShowActivityModal(false);
                    }}
                    onCancel={() => setShowActivityModal(false)}
                />
            </Modal>

            <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Nouvel Événement">
                <EventForm
                    teachers={mockTeachers}
                    onSave={(event) => {
                        console.log('Événement créé:', event);
                        // TODO: API call to save event
                        setShowEventModal(false);
                    }}
                    onCancel={() => setShowEventModal(false)}
                />
            </Modal>

            <Modal isOpen={showMeetingModal} onClose={() => setShowMeetingModal(false)} title="Nouvelle Réunion">
                <MeetingForm
                    teachers={mockTeachers}
                    students={mockStudents}
                    onSave={(meeting) => {
                        console.log('Réunion créée:', meeting);
                        // TODO: API call to save meeting
                        setShowMeetingModal(false);
                    }}
                    onCancel={() => setShowMeetingModal(false)}
                />
            </Modal>

            <Modal isOpen={showIncidentModal} onClose={() => setShowIncidentModal(false)} title="Signaler un Incident">
                <IncidentForm
                    students={mockStudents}
                    teachers={mockTeachers}
                    onSave={(incident) => {
                        console.log('Incident signalé:', incident);
                        // TODO: API call to save incident
                        setShowIncidentModal(false);
                    }}
                    onCancel={() => setShowIncidentModal(false)}
                />
            </Modal>

            <Modal isOpen={showAssociationModal} onClose={() => setShowAssociationModal(false)} title="Nouvelle Association">
                <AssociationForm
                    teachers={mockTeachers}
                    students={mockStudents}
                    onSave={(association) => {
                        console.log('Association créée:', association);
                        // TODO: API call to save association
                        setShowAssociationModal(false);
                    }}
                    onCancel={() => setShowAssociationModal(false)}
                />
            </Modal>

            <Modal isOpen={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} title="Nouvelle Annonce">
                <AnnouncementForm
                    onSave={(announcement) => {
                        console.log('Annonce publiée:', announcement);
                        // TODO: API call to save announcement
                        setShowAnnouncementModal(false);
                    }}
                    onCancel={() => setShowAnnouncementModal(false)}
                />
            </Modal>
        </div>
    );
};

export default SchoolLife;
