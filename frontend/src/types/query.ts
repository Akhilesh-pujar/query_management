

export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'open' | 'In Progress' | 'Resolved';

export interface Query {
  serialNumber: number;
  queryNumber: string;
  dateRaised: string;
  title: string;
  subject: string;
  queryTo: string;
  priority: Priority;
  description: string;
  attachment?: File;
  assignTo?: string;
  resolutionDate?: string;
  status: Status;
  comments?: QueryComment[];
}

export interface UpdateQueryPayload {
  assignedTo: string;
  status: Status;
  queryTo: string;
}

export interface CommentFormData {
  query_number: string;
  comment: string;
  updated_by: string;
  status: Status;
}

export interface CommentResponse {
  message: string;
  query_number: string;
  query_history: QueryComment[];
}
export interface QueryComment {
  comment: string;
  status: Status;
  updated_by__email: string;
  created_at: string;
}