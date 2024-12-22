export interface Query {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assignee: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export type QueryFilter = {
    status?: Query['status'];
    priority?: Query['priority'];
    assignee?: string;
  };
