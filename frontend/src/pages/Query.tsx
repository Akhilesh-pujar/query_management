import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
 
 import { Textarea } from '@/components/ui/textarea'
import { Tickets, TimelineEvent } from '../data/Ticket'
import AllQueries from './Query_pagination'
export default function Query() {
  const { id } = useParams<{ id: string }>()
  const ticket = Tickets.find(t => t.id === parseInt(id || ''))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  

  if (!ticket) {
    return <div>Ticket not found</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleAddProgress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Here you would typically send this data to your backend
    // For now, we'll just close the dialog
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ticket.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
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
            <p className="text-sm font-medium text-gray-500">Created By:</p>
            <p>{ticket.createdBy}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created At:</p>
            <p>{formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Last Updated:</p>
            <p>{formatDate(ticket.lastUpdated)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Details:</p>
            <p>{ticket.details}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-gray-200 dark:border-gray-700">
            {ticket.timeline.map((event: TimelineEvent) => (
              <li key={event.id} className="mb-10 ml-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{formatDate(event.date)}</time>
                <p className="text-base font-normal text-gray-500 dark:text-gray-400">{event.description}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Add Progress / Resolution</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress / Resolution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProgress} className="space-y-4">
            <div>
              <label htmlFor="progress" className="text-sm font-medium text-gray-700">Progress / Resolution</label>
              <Textarea id="progress" placeholder="Describe the progress or resolution..." />
            </div>
            <div>
              <label htmlFor="status" className="text-sm font-medium text-gray-700">New Status</label>
              <select id="status" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
      <AllQueries/>

      <Button asChild variant="outline">
        <Link to="/">Back to Tickets</Link>
      </Button>
    </div>
  )
}

