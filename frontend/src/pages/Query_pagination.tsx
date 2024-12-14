import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tickets } from '../data/Ticket'

export default function AllQueries() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 1 // Number of queries per page

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTickets = Tickets.slice(startIndex, endIndex)
  const totalPages = Math.ceil(Tickets.length / itemsPerPage)

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Queries</h1>

      {paginatedTickets.map(ticket => (
        <Card key={ticket.id}>
          <CardHeader>
            <CardTitle>{ticket.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Assigned To:</p>
              <p>{ticket.assignedTo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Department:</p>
              <p>{ticket.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status:</p>
              <Badge variant={ticket.status === 'pending' ? 'warning' : 'success'}>
                {ticket.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At:</p>
              <p>{formatDate(ticket.createdAt)}</p>
            </div>
            <Button asChild variant="outline">
              <Link to={`/query/${ticket.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => changePage(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => changePage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
