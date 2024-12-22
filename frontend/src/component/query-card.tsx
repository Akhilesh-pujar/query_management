import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Query } from "@/types";
import { AlertCircle, Clock, User } from "lucide-react";

interface QueryCardProps {
  query: Query;
  onClick: (query: Query) => void;
}

export function QueryCard({ query, onClick }: QueryCardProps) {
  const statusColors = {
    open: "bg-blue-500",
    "in-progress": "bg-yellow-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",
  };

  const priorityColors = {
    low: "bg-blue-200 text-blue-700",
    medium: "bg-yellow-200 text-yellow-700",
    high: "bg-red-200 text-red-700",
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={() => onClick(query)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{query.title}</CardTitle>
          <Badge className={priorityColors[query.priority]}>
            {query.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {query.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={statusColors[query.status]}>
              {query.status}
            </Badge>
            <div className="flex items-center gap-1 text-gray-500">
              <User className="h-4 w-4" />
              <span>{query.assignee}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{new Date(query.updatedAt).toLocaleDateString()}</span>
            <AlertCircle/>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}