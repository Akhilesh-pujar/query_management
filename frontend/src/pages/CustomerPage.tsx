import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueryForm } from "./QueryForm";
import { useAuth } from "../hooks/useAuth";
import { z } from "zod";

export const querySchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  queryTo: z.string().min(1, "Query To is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  description: z.string().min(1, "Description is required"),
});

export type Query = z.infer<typeof querySchema> & {
  query_number: string;
  status: string; // Added the 'status' field
  attachment?: File;
};

export const CustomerPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useAuth();

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
          queryTo: item.queryTo,
          priority: item.priority,
          status: item.status,
        }));

        setQueries(mappedQueries);
        setFilteredQueries(mappedQueries);
      } catch (error) {
        console.error("Error fetching queries:", error);
      }
    };
    fetchQueries();
  }, [token]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredQueries(
        queries.filter(
          (query) =>
            query.query_number.toLowerCase().includes(lowercasedTerm) ||
            query.title.toLowerCase().includes(lowercasedTerm) ||
            query.subject.toLowerCase().includes(lowercasedTerm) ||
            query.status.toLowerCase().includes(lowercasedTerm)
        )
      );
    }, 300); // Debounce delay

    return () => clearTimeout(handler);
  }, [searchTerm, queries]);

  const handleQuerySubmit = (newQuery: Query) => {
    setQueries([...queries, newQuery]);
    setFilteredQueries([...filteredQueries, newQuery]);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "bg-yellow-500 text-white";
      case "pending":
        return "bg-orange-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Query Management</h1>

      {/* Search Bar */}
      <div className="mb-4 flex justify-center">
        <Input
          type="text"
          placeholder="Search queries by number, title, subject, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border rounded-md px-4 py-2"
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((query) => (
            <Card key={query.query_number} className="shadow-md">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{query.title}</span>
                  <Badge className={`px-2 py-1 rounded-lg ${getStatusBadge(query.status)}`}>
                    {query.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Query Number:</strong> {query.query_number}
                </p>
                <p>
                  <strong>Subject:</strong> {query.subject}
                </p>
                <p>
                  <strong>Query To:</strong> {query.queryTo}
                </p>
                <p>
                  <strong>Priority:</strong> {query.priority}
                </p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Raised query related to {query.subject}.
                </p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No queries found matching your search criteria.
          </p>
        )}
      </div>
    </div>
  );
};
