import { QueryCard } from "@/component/query-card";
import { Query, QueryFilter } from "@/types";

interface QueryListProps {
  queries: Query[];
  filters: QueryFilter;
  onQueryClick: (query: Query) => void;
}

export function QueryList({ queries, filters, onQueryClick }: QueryListProps) {
  const filteredQueries = queries.filter((query) => {
    if (filters.status && query.status !== filters.status) return false;
    if (filters.priority && query.priority !== filters.priority) return false;
    if (filters.assignee && query.assignee !== filters.assignee) return false;
    return true;
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredQueries.map((query) => (
        <QueryCard key={query.id} query={query} onClick={onQueryClick} />
      ))}
    </div>
  );
}