import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'


export type Priority = 'Low' | 'Medium' | 'High'
export type Status = 'open' | 'in-progress' | 'resolved'

export interface QueryInterface {
  serialNumber: number
  queryNumber: string
  dateRaised: string
  title: string
  subject: string
  queryTo: string
  priority: Priority
  description: string
  attachment?: File
  assignTo?: string
  resolutionDate?: string
  status: Status
}

export interface APIQueryResponse {
  serialNumber: number
  queryNumber: string
  dateRaised: string
  title: string
  subject: string
  queryTo: string
  priority: Priority
  description: string
  assignTo: string | null
  resolutionDate: string | null
  status: Status
}

export interface UpdateQueryPayload {
  assignedTo: string
  status: Status
  queryTo: string
}


const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const Query = () => {
  const [queries, setQueries] = useState<QueryInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<QueryInterface | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UpdateQueryPayload>({
    assignedTo: 'enter staff mail ',
    status: 'open',
    queryTo: '',
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchQueries()
  }, [])

  const mapAPIResponseToQuery = (apiQuery: APIQueryResponse): QueryInterface => ({
    ...apiQuery,
    assignTo: apiQuery.assignTo || undefined,
    resolutionDate: apiQuery.resolutionDate || undefined,
  })

  const fetchQueries = async () => {
    try {
      setError(null)
      const email = localStorage.getItem('email')
      
      if (!email) {
        throw new Error('No email found in localStorage')
      }

      const response = await fetch(`${API_URL}/api/queries/internalqueries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server')
      }

      setQueries(data.map(mapAPIResponseToQuery))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error fetching queries",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  
  const handleSubmit = async () => {
    if (!selectedQuery) return

    try {
      setUpdating(true)
      
      const response = await fetch('http://127.0.0.1:8000/api/queries/update/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
           // Include the token if required
        },
       
        body: JSON.stringify({
          ...formData,
        queryNumber: selectedQuery.queryNumber
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedData: APIQueryResponse = await response.json()
      
      setQueries(prevQueries => 
        prevQueries.map(q =>
          q.serialNumber === selectedQuery.serialNumber
            ? mapAPIResponseToQuery(updatedData)
            : q
        )
      )
        fetchQueries();
      toast({
        title: "Success",
        description: "Query updated successfully",
      })
      setDialogOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      toast({
        variant: "destructive",
        title: "Error updating query",
        description: errorMessage,
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }


  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/15 border border-destructive text-destructive rounded-lg p-4">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
    <Toaster />
    <h1 className="text-2xl font-bold mb-4">Internal Query Management</h1>
    
    <Table>
      <TableCaption>List of Customer Queries</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Serial No.</TableHead>
          <TableHead>Query Number</TableHead>
          <TableHead>Date Raised</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Query To</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Resolution Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queries.map((query) => (
          <TableRow key={query.queryNumber}>
            <TableCell>{query.serialNumber}</TableCell>
            <TableCell>{query.queryNumber}</TableCell>
            <TableCell>{query.dateRaised}</TableCell>
            <TableCell>{query.subject}</TableCell>
            <TableCell>{query.queryTo}</TableCell>
            <TableCell>{query.assignTo || 'Unassigned'}</TableCell>
            <TableCell>{query.resolutionDate || 'N/A'}</TableCell>
            <TableCell>{query.status}</TableCell>
            <TableCell>
  <Dialog
    open={dialogOpen && selectedQuery?.queryNumber === query.queryNumber}
    onOpenChange={(open) => {
      setDialogOpen(open)
      if (open) {
        setSelectedQuery(query) // Set the specific query
        setFormData({
          assignedTo: query.assignTo || '',
          status: query.status,
          queryTo: query.queryTo,
        }) // Initialize form data with current query details
      } else {
        setSelectedQuery(null)
      }
    }}
  >
    <DialogTrigger asChild>
      <Button variant="outline">Manage</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Query: {selectedQuery?.queryNumber || query.queryNumber}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="queryTo">Query To:</label>
          <Select
            onValueChange={(value) => setFormData((prev) => ({ ...prev, queryTo: value }))}
            value={formData.queryTo}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales Department">Sales Department</SelectItem>
              <SelectItem value="IT SUPPORT">IT Support</SelectItem>
              <SelectItem value="Customer Service">Customer Service</SelectItem>
              <SelectItem value="Technical Team">Technical Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="assignTo">Assign to:</label>
          <Input
            id="assignTo"
            value={formData.assignedTo}
            className="col-span-3"
            onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="status">Status:</label>
          <Select
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Status }))}
            value={formData.status}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Submit'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  )
}

export default Query


