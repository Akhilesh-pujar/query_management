import React, { useState, useEffect } from "react";
import Fuse from "fuse.js"; // Import fuse.js
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
import { useAuth } from "../hooks/useAuth";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QueryForm } from "./QueryForm";
import { z } from "zod";

export const querySchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  query_to: z.string().min(1, "Query To is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  description: z.string().min(1, "Description is required"),
});

export type Query = z.infer<typeof querySchema> & {
  query_number: string;
  status: string;
  attachment?: File;
};

export const CustomerPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchQueries = async () => {
      const email = localStorage.getItem("email");
      if (!email) {
        console.error("No email found in local storage");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/queries/list/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch queries");
        }

        const data = await response.json();

        const mappedQueries: Query[] = data.map((item: any) => ({
          query_number: item.query_number,
          title: item.title,
          subject: item.subject,
          query_to: item.query_to,
          priority: item.priority,
          status: item.status,
        }));

        setQueries(mappedQueries);
      } catch (error) {
        console.error("Error fetching queries:", error);
      }
    };
    fetchQueries();
  }, [token]);

  const handleQuerySubmit = (newQuery: Query) => {
    setQueries([...queries, newQuery]);
    setIsDialogOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // Configure Fuse.js
  const fuse = new Fuse(queries, {
    keys: ["query_number", "title", "subject", "query_to", "priority", "status"], // Fields to search
    threshold: 0.3, // Adjust for sensitivity
  });

  const filteredQueries =
    searchTerm.trim() === ""
      ? queries // Show all queries if no search term
      : fuse.search(searchTerm).map((result) => result.item);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customer Query Management</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

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
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQueries.length > 0 ? (
            filteredQueries.map((query) => (
              <TableRow key={query.query_number}>
                <TableCell>{query.query_number}</TableCell>
                <TableCell>{query.title}</TableCell>
                <TableCell>{query.subject}</TableCell>
                <TableCell>{query.query_to}</TableCell>
                <TableCell>{query.priority}</TableCell>
                <TableCell>{query.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>No matching queries found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
