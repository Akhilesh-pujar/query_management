import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '../hooks/useAuth';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QueryForm } from './QueryForm';
import { z } from 'zod';

export const querySchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  queryTo: z.string().min(1, "Query To is required"),
  priority: z.enum(['Low', 'Medium', 'High']),
  description: z.string().min(1, "Description is required"),
});

export type Query = z.infer<typeof querySchema> & {
  queryNumber: string;
  status: string; // Added the 'status' field
  attachment?: File;
};

export const CustomerPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchQueries = async () => {
      const email = localStorage.getItem('email');
      if (!email) {
        console.error('No email found in local storage');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/queries/list/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch queries');
        }

        const data = await response.json();

        // Ensure data mapping includes 'status'
        const mappedQueries: Query[] = data.map((item: any) => ({
          queryNumber: item.query_number,
          title: item.title,
          subject: item.subject,
          queryTo: item.query_to,
          priority: item.priority,
          status: item.status, // Map 'status' field
        }));

        setQueries(mappedQueries);
      } catch (error) {
        console.error('Error fetching queries:', error);
      }
    };
    fetchQueries();
  }, [token]);

  const handleQuerySubmit = (newQuery: Query) => {
    setQueries([...queries, newQuery]);
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Query Management</h1>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Raise Query</Button>
        </DialogTrigger>
        <DialogContent>
          <QueryForm onSubmit={handleQuerySubmit} />
        </DialogContent>
      </Dialog>

      <Table className="mt-8">
        <TableCaption>List of Raised Queries</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Query Number</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Query To</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead> {/* Added Status column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((query) => (
            <TableRow key={query.queryNumber}>
              <TableCell>{query.queryNumber}</TableCell>
              <TableCell>{query.title}</TableCell>
              <TableCell>{query.subject}</TableCell>
              <TableCell>{query.queryTo}</TableCell>
              <TableCell>{query.priority}</TableCell>
              <TableCell>{query.status}</TableCell> {/* Added Status value */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
