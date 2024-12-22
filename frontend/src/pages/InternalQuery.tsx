import { useState, useEffect } from 'react'

import { QueryTable } from '@/component/query-table';
import { Query,CommentResponse } from '@/types/query';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import * as api from '@/lib/api';



const InternalQuery = () => {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
 
    
  
  useEffect(() => {
    // Set default email if none exists
   
    fetchQueries();
   
  }, []);
  

  const fetchQueries = async () => {
    try {
      const email = localStorage.getItem('email')  ;
      const data = await api.fetchQueries(email);
      setQueries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Error fetching queries",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuery = async (queryNumber: string, data: any) => {
    try {
      await api.updateQuery(queryNumber, data);
      await fetchQueries();
      toast({
        title: "Success",
        description: "Query updated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Error updating query",
        description: errorMessage,
      });
    }
  };

  const handleAddComment = async (data: any) => {
    try {
      const response: CommentResponse = await api.addComment(data);
      
      // Update the queries state with the new comments
      setQueries(prevQueries => prevQueries.map(query => {
        if (query.queryNumber === response.query_number) {
          return {
            ...query,
            comments: response.query_history,
            status: data.status // Update query status with the new comment status
          };
        }
        return query;
      }));
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Error adding comment",
        description: errorMessage,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  
  return (
    <div className="container mx-auto p-4">
    <Toaster />
    <h1 className="text-2xl font-bold mb-4">Internal Query Management</h1>
    <QueryTable
      queries={queries}
      onUpdateQuery={handleUpdateQuery}
      onAddComment={handleAddComment}
    />
  </div>
  )
}

export default InternalQuery


