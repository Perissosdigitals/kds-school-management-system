import { httpClient } from '../httpClient';
import type { Activity, Event, Meeting, Incident, Association } from '../../types';

// Backend Entity Interface
export interface SchoolEventEntity {
  id: string;
  title: string;
  description?: string;
  event_type: 'open_house' | 'sports' | 'cultural' | 'academic' | 'meeting' | 'ceremony' | 'other';
  eventType?: 'open_house' | 'sports' | 'cultural' | 'academic' | 'meeting' | 'ceremony' | 'other';
  start_date: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  location?: string;
  participants?: string | any[]; // Backend might send it as string or array
  status: string; // Keep it flexible for localized values
  created_by?: string;
  responsibleTeacherId?: string;
}

export interface IncidentEntity {
  id: string;
  student_id: string;
  studentId?: string;
  type: 'incident' | 'sanction' | 'encouragement';
  severity: 'minor' | 'moderate' | 'serious' | 'very_serious';
  description: string;
  date: string;
  location?: string;
  reported_by?: string;
  reportedBy?: string;
  status: string;
  actions_taken?: string;
  actionsTaken?: string;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

export interface AssociationEntity {
  id: string;
  name: string;
  type: 'student_club' | 'parent_association' | 'ngo_partnership' | 'other';
  description?: string;
  president_id?: string;
  members?: string; // JSON string
  advisor_id?: string;
  status: 'active' | 'inactive' | 'creating';
  budget: number;
  created_at: string;
  updated_at: string;
}

// Mappers
const mapToActivity = (entity: SchoolEventEntity): Activity => {
  let participantsList: string[] = [];
  try {
    if (entity.participants) {
      if (typeof entity.participants === 'string') {
        participantsList = JSON.parse(entity.participants);
      } else if (Array.isArray(entity.participants)) {
        participantsList = entity.participants;
      }
    }
  } catch (e) {
    console.warn('Failed to parse participants', e);
  }

  return {
    id: entity.id,
    name: entity.title,
    category: entity.eventType === 'sports' || entity.event_type === 'sports' ? 'Sport' :
      entity.eventType === 'cultural' || entity.event_type === 'cultural' ? 'Arts' : 'Autre',
    description: entity.description || '',
    responsibleTeacherId: entity.responsibleTeacherId || entity.created_by, // Mapping created_by to responsibleTeacherId
    schedule: new Date(entity.startDate || entity.start_date).toLocaleString('fr-FR'),
    location: entity.location || '',
    currentParticipants: participantsList.length,
    maxParticipants: 0, // Not supported by backend yet
    startDate: entity.startDate || entity.start_date,
    endDate: entity.endDate || entity.end_date,
    status: (entity.status === 'scheduled' || entity.status === 'Planifié') ? 'Planifiée' :
      (entity.status === 'ongoing' || entity.status === 'En cours') ? 'En cours' :
        (entity.status === 'completed' || entity.status === 'Terminé') ? 'Terminée' : 'Annulée',
    participants: participantsList,
    createdAt: new Date().toISOString(), // Missing in entity interface but required by type
    updatedAt: new Date().toISOString()
  };
};

const mapToEvent = (entity: any): Event => {
  let participantsList: string[] = [];
  try {
    if (entity.participants) {
      participantsList = typeof entity.participants === 'string' ? JSON.parse(entity.participants) : entity.participants;
    }
  } catch (e) {
    console.warn('Failed to parse participants', e);
  }

  return {
    id: entity.id,
    title: entity.title,
    type: 'Autre', // Default
    description: entity.description || '',
    date: new Date(entity.startDate || entity.start_date).toISOString().split('T')[0],
    startTime: new Date(entity.startDate || entity.start_date).toTimeString().slice(0, 5),
    endTime: (entity.endDate || entity.end_date) ? new Date(entity.endDate || entity.end_date).toTimeString().slice(0, 5) : '',
    location: entity.location || '',
    organizers: (entity.responsibleTeacherId || entity.created_by) ? [entity.responsibleTeacherId || entity.created_by] : [],
    targetAudience: "Toute l'école",
    participants: participantsList,
    status: (entity.status === 'scheduled' || entity.status === 'Planifié') ? 'Planifié' :
      (entity.status === 'ongoing' || entity.status === 'En cours') ? 'En cours' :
        (entity.status === 'completed' || entity.status === 'Terminé') ? 'Terminé' : 'Annulé',
    createdBy: entity.responsibleTeacherId || entity.created_by || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const mapToMeeting = (entity: SchoolEventEntity): Meeting => ({
  id: entity.id,
  title: entity.title,
  type: 'Autre',
  description: entity.description || '',
  date: new Date(entity.start_date).toISOString().split('T')[0],
  startTime: new Date(entity.start_date).toTimeString().slice(0, 5),
  endTime: entity.end_date ? new Date(entity.end_date).toTimeString().slice(0, 5) : '',
  location: entity.location || '',
  organizer: entity.created_by || '',
  invitees: [],
  attendees: [],
  status: entity.status === 'scheduled' ? 'Planifiée' :
    entity.status === 'ongoing' ? 'En cours' :
      entity.status === 'completed' ? 'Terminée' : 'Annulée',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const mapToIncident = (entity: IncidentEntity): Incident => {
  const severityMap: Record<string, any> = {
    'minor': 'Mineur',
    'moderate': 'Modéré',
    'serious': 'Grave',
    'very_serious': 'Très grave'
  };
  const statusMap: Record<string, any> = {
    'reported': 'Signalé',
    'investigating': 'En traitement',
    'resolved': 'Résolu',
    'closed': 'Clos'
  };

  return {
    id: entity.id,
    studentId: entity.studentId || entity.student_id,
    date: new Date(entity.date).toISOString().split('T')[0],
    time: new Date(entity.date).toTimeString().slice(0, 5),
    location: entity.location || '',
    description: entity.description,
    severity: severityMap[entity.severity] || 'Mineur',
    reportedBy: entity.reported_by || '',
    status: statusMap[entity.status] || 'Signalé',
    followUp: entity.actions_taken,
    parentNotified: false,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at
  };
};

const mapToAssociation = (entity: AssociationEntity): Association => {
  const typeMap: Record<string, any> = {
    'student_club': 'Club étudiant',
    'parent_association': 'Association parents',
    'ngo_partnership': 'Partenariat ONG',
    'other': 'Autre'
  };
  const statusMap: Record<string, any> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'creating': 'En création'
  };

  let membersList: string[] = [];
  try {
    if (entity.members) {
      membersList = JSON.parse(entity.members);
    }
  } catch (e) {
    console.warn('Failed to parse association members', e);
  }

  return {
    id: entity.id,
    name: entity.name,
    type: typeMap[entity.type] || 'Autre',
    description: entity.description || '',
    presidentId: entity.president_id,
    members: membersList,
    advisorId: entity.advisor_id,
    foundingDate: entity.created_at,
    status: statusMap[entity.status] || 'Active',
    activities: [],
    budget: Number(entity.budget),
    createdAt: entity.created_at,
    updatedAt: entity.updated_at
  };
};

export const SchoolLifeService = {
  // --- Activities (Mapped to SchoolEvents) ---
  async getActivities(): Promise<Activity[]> {
    try {
      const response = await httpClient.get<SchoolEventEntity[]>('/school-life/events');
      // Filter for activity-like events
      const activities = response.data.filter(e =>
        ['sports', 'cultural', 'academic'].includes(e.event_type)
      );
      return activities.map(mapToActivity);
    } catch (error) {
      console.warn('SchoolLifeService: Failed to fetch activities', error);
      return [];
    }
  },

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    const statusMap: Record<string, string> = {
      'Planifiée': 'scheduled',
      'En cours': 'ongoing',
      'Terminée': 'completed',
      'Annulée': 'cancelled'
    };

    const payload = {
      title: activity.name,
      description: activity.description,
      eventType: activity.category === 'Sport' ? 'sports' : 'cultural', // CamelCase for DTO
      startDate: activity.startDate || new Date().toISOString(),
      endDate: activity.endDate,
      location: activity.location,
      participants: activity.participants || [],
      status: statusMap[activity.status || 'Planifiée'] || 'scheduled',
      createdBy: activity.responsibleTeacherId
    };
    const response = await httpClient.post<SchoolEventEntity>('/school-life/events', payload);
    return mapToActivity(response.data);
  },

  // --- Events ---
  async getEvents(): Promise<Event[]> {
    try {
      const response = await httpClient.get<SchoolEventEntity[]>('/school-life/events');
      const events = response.data.filter(e =>
        ['open_house', 'ceremony', 'other'].includes(e.event_type)
      );
      return events.map(mapToEvent);
    } catch (error) {
      console.warn('SchoolLifeService: Failed to fetch events', error);
      return [];
    }
  },

  async createEvent(event: Partial<Event>): Promise<Event> {
    const payload = {
      title: event.title,
      description: event.description,
      eventType: 'other', // Default
      startDate: event.date ? `${event.date}T${event.startTime || '00:00'}:00Z` : new Date().toISOString(),
      endDate: event.date && event.endTime ? `${event.date}T${event.endTime}:00Z` : undefined,
      location: event.location,
      participants: event.participants || [],
      status: 'scheduled',
      createdBy: event.createdBy
    };
    const response = await httpClient.post<SchoolEventEntity>('/school-life/events', payload);
    return mapToEvent(response.data);
  },

  // --- Meetings ---
  async getMeetings(): Promise<Meeting[]> {
    try {
      const response = await httpClient.get<SchoolEventEntity[]>('/school-life/events?eventType=meeting');
      return response.data.map(mapToMeeting);
    } catch (error) {
      console.warn('SchoolLifeService: Failed to fetch meetings', error);
      return [];
    }
  },

  async createMeeting(meeting: Partial<Meeting>): Promise<Meeting> {
    const payload = {
      title: meeting.title,
      description: meeting.description,
      eventType: 'meeting',
      startDate: meeting.date ? `${meeting.date}T${meeting.startTime || '00:00'}:00Z` : new Date().toISOString(),
      endDate: meeting.date && meeting.endTime ? `${meeting.date}T${meeting.endTime}:00Z` : undefined,
      location: meeting.location,
      participants: meeting.attendees || [],
      status: 'scheduled',
      createdBy: meeting.organizer
    };
    const response = await httpClient.post<SchoolEventEntity>('/school-life/events', payload);
    return mapToMeeting(response.data);
  },

  // --- Discipline ---
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await httpClient.get<IncidentEntity[]>('/school-life/incidents');
      return response.data.map(mapToIncident);
    } catch (error) {
      console.warn('SchoolLifeService: Failed to fetch incidents', error);
      return [];
    }
  },

  async createIncident(incident: Partial<Incident>): Promise<Incident> {
    const severityMap: Record<string, string> = {
      'Mineur': 'minor',
      'Modéré': 'moderate',
      'Grave': 'serious',
      'Très grave': 'very_serious'
    };
    const statusMap: Record<string, string> = {
      'Signalé': 'reported',
      'En traitement': 'investigating',
      'Résolu': 'resolved',
      'Clos': 'closed'
    };

    const payload = {
      student_id: incident.studentId,
      type: 'incident', // Defaulting to incident for now
      severity: severityMap[incident.severity || 'Mineur'] || 'minor',
      description: incident.description,
      date: incident.date ? new Date(incident.date).toISOString() : new Date().toISOString(),
      location: incident.location,
      reported_by: incident.reportedBy,
      status: statusMap[incident.status || 'Signalé'] || 'reported',
      actions_taken: incident.followUp
    };
    const response = await httpClient.post<IncidentEntity>('/school-life/incidents', payload);
    return mapToIncident(response.data);
  },

  // --- Associations ---
  async getAssociations(): Promise<Association[]> {
    try {
      const response = await httpClient.get<AssociationEntity[]>('/school-life/associations');
      return response.data.map(mapToAssociation);
    } catch (error) {
      console.warn('SchoolLifeService: Failed to fetch associations', error);
      return [];
    }
  },

  async createAssociation(association: Partial<Association>): Promise<Association> {
    const typeMap: Record<string, string> = {
      'Club étudiant': 'student_club',
      'Association parents': 'parent_association',
      'Partenariat ONG': 'ngo_partnership',
      'Autre': 'other'
    };
    const statusMap: Record<string, string> = {
      'Active': 'active',
      'Inactive': 'inactive',
      'En création': 'creating'
    };

    const payload = {
      name: association.name,
      type: typeMap[association.type || 'Autre'] || 'other',
      description: association.description,
      president_id: association.presidentId,
      advisor_id: association.advisorId,
      status: statusMap[association.status || 'Active'] || 'active',
      budget: association.budget || 0,
      members: JSON.stringify(association.members || [])
    };
    const response = await httpClient.post<AssociationEntity>('/school-life/associations', payload);
    return mapToAssociation(response.data);
  }
};
