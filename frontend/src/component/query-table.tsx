import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Query } from "@/types/query";
import { QueryActions } from "./query-actions";
import { QueryComments } from "./query-comments";
import { ShowCommentsDialog } from "./show-comments-dailog";

// Function to get the badge color based on the status
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

interface QueryCardsProps {
  queries: Query[];
  onUpdateQuery: (queryNumber: string, data: any) => Promise<void>;
  onAddComment: (data: any) => Promise<void>;
}

export function QueryTable({ queries, onUpdateQuery, onAddComment }: QueryCardsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQueries, setFilteredQueries] = useState<Query[]>(queries);

  // Debounce implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredQueries(
        queries.filter(
          (query) =>
            query.queryNumber.toLowerCase().includes(lowercasedTerm) ||
            query.subject.toLowerCase().includes(lowercasedTerm) ||
            query.status.toLowerCase().includes(lowercasedTerm)
        )
      );
    }, 300); // Debounce delay: 300ms

    return () => clearTimeout(handler); // Cleanup on change
  }, [searchTerm, queries]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 flex justify-center">
        <Input
          type="text"
          placeholder="Search queries by number, subject, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border rounded-md px-4 py-2"
        />
      </div>

      {/* Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((query) => (
            <Card key={query.queryNumber} className="shadow-md border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Query Number: {query.queryNumber}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Serial No.: {query.serialNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Subject:</span> {query.subject}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Query To:</span> {query.queryTo}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Assigned To:</span>{" "}
                    {query.assignTo || "Unassigned"}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">Status:</span>
                    <Badge className={`px-2 py-1 rounded-lg ${getStatusBadge(query.status)}`}>
                      {query.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <QueryActions query={query} onUpdate={onUpdateQuery} />
                  <QueryComments query={query} onAddComment={onAddComment} />
                  <ShowCommentsDialog
                    queryNumber={query.queryNumber}
                    comments={query.comments || []}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No queries found matching your search criteria.</p>
        )}
      </div>
    </div>
  );
}
