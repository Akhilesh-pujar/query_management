import { Link } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tickets } from '../data/Ticket'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div>
        <nav>
            <Link to="/query/1">
            <Button >Query page</Button>
            </Link>
            <Link to="/login">
            <Button >Login page</Button>
            </Link>
            <Link to="/signup">
            <Button >Sign up page</Button>
            </Link>
        </nav>
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Link to={`/query/${ticket.id}`} className="text-blue-600 hover:underline">
                  {ticket.name}
                </Link>
              </TableCell>
              <TableCell>{ticket.assignedTo}</TableCell>
              <TableCell>{ticket.department}</TableCell>
              <TableCell>
                <Badge variant={ticket.status === 'pending' ? 'warning' : 'success'}>
                  {ticket.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


