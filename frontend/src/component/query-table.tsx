import React, { useState } from "react";
import Fuse from "fuse.js"; // Import fuse.js
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Query } from "@/types/query";
import { QueryActions } from "./query-actions";
import { QueryComments } from "./query-comments";
import { ShowCommentsDialog } from "./show-comments-dailog";
import { Button } from "@/components/ui/button";

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
 

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface QueryTableProps {
  queries: Query[];
  onUpdateQuery: (queryNumber: string, data: any) => Promise<void>;
  onAddComment: (data: any) => Promise<void>;
}

export function QueryTable({ queries, onUpdateQuery, onAddComment }: QueryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce with 300ms delay

  // Configure Fuse.js
  const fuse = new Fuse(queries, {
    keys: ["queryNumber", "subject", "queryTo", "assignTo", "status"], // Fields to search
    threshold: 0.3, // Adjust for sensitivity (lower = stricter match)
  });
  const handleLogout = () => {
 
    window.location.href = "/login";
  };

  // Perform fuzzy search
  const filteredQueries =
    debouncedSearchTerm.trim() === ""
      ? queries // Show all queries if no search term
      : fuse.search(debouncedSearchTerm).map((result) => result.item);


    
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Internal Query Management</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {/* Search Input */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Table */}
      <Table>
        <TableCaption>List of Customer Queries</TableCaption>
        
        <TableHeader>
          <TableRow>
            <TableHead>Query Number</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Query To</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQueries.length > 0 ? (
            filteredQueries.map((query) => (
              <TableRow key={query.queryNumber}>
                <TableCell>{query.queryNumber}</TableCell>
                <TableCell>{query.subject}</TableCell>
                <TableCell>{query.queryTo}</TableCell>
                <TableCell>{query.assignTo || "Unassigned"}</TableCell>
                <TableCell>{query.status}</TableCell>
                <TableCell>
                  <QueryActions query={query} onUpdate={onUpdateQuery} />
                </TableCell>
                <TableCell>
                  <QueryComments query={query} onAddComment={onAddComment} />
                </TableCell>
                <TableCell>
                  <ShowCommentsDialog
                    queryNumber={query.queryNumber}
                    comments={query.comments || []}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>No matching queries found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


