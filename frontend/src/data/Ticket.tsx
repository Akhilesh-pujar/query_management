export interface TimelineEvent {
    id: number;
    description: string;
    date: string;
    type: 'created' | 'updated' | 'resolved';
  }
  
  export interface Ticket {
    id: number;
    name: string;
    assignedTo: string;
    department: string;
    status: 'pending' | 'resolved';
    details: string;
    createdBy: string;
    createdAt: string;
    lastUpdated: string;
    timeline: TimelineEvent[];
  }
  
  export const Tickets: Ticket[] = [
    { 
      id: 1, 
      name: 'Server Down', 
      assignedTo: 'John Doe', 
      department: 'IT',
      status: 'pending', 
      details: 'The main server is not responding.',
      createdBy: 'Alice Johnson',
      createdAt: '2023-06-15T10:30:00Z',
      lastUpdated: '2023-06-15T14:45:00Z',
      timeline: [
        { id: 1, description: 'Ticket created', date: '2023-06-15T10:30:00Z', type: 'created' },
        { id: 2, description: 'Assigned to John Doe', date: '2023-06-15T11:00:00Z', type: 'updated' },
        { id: 3, description: 'John started investigating', date: '2023-06-15T14:45:00Z', type: 'updated' },
      ]
    },
    { 
      id: 2, 
      name: 'Login Issue', 
      assignedTo: 'Jane Smith', 
      department: 'Security',
      status: 'resolved', 
      details: 'Users were unable to log in. Fixed by updating the authentication service.',
      createdBy: 'Bob Wilson',
      createdAt: '2023-06-14T09:15:00Z',
      lastUpdated: '2023-06-14T16:30:00Z',
      timeline: [
        { id: 1, description: 'Ticket created', date: '2023-06-14T09:15:00Z', type: 'created' },
        { id: 2, description: 'Assigned to Jane Smith', date: '2023-06-14T10:00:00Z', type: 'updated' },
        { id: 3, description: 'Jane identified the issue', date: '2023-06-14T13:20:00Z', type: 'updated' },
        { id: 4, description: 'Authentication service updated', date: '2023-06-14T15:45:00Z', type: 'updated' },
        { id: 5, description: 'Issue resolved', date: '2023-06-14T16:30:00Z', type: 'resolved' },
      ]
    },
    { 
      id: 3, 
      name: 'Data Sync Error', 
      assignedTo: 'Bob Johnson', 
      department: 'Development',
      status: 'pending', 
      details: 'Data is not syncing between the mobile app and the web interface.' ,
      createdBy: '',
      createdAt: '',
      lastUpdated: '',
      timeline: []
    },
  ]
  