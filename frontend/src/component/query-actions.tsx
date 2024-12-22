import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Query, Status, UpdateQueryPayload } from "@/types/query";
import { useState } from "react";

interface QueryActionsProps {
  query: Query;
  onUpdate: (queryNumber: string, data: UpdateQueryPayload) => Promise<void>;
}

export function QueryActions({ query, onUpdate }: QueryActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateQueryPayload>({
    assignedTo: query.assignTo || '',
    status: query.status,
    queryTo: query.queryTo,
  });
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async () => {
    try {
      setUpdating(true);
      await onUpdate(query.queryNumber, formData);
      setIsOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Query: {query.queryNumber}</DialogTitle>
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
                <SelectItem value="Customer Support">Customer Support</SelectItem>
                <SelectItem value="IT SUPPORT">IT Support</SelectItem>
                <SelectItem value="IT TEAM">IT TEAM</SelectItem>
               
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
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updating}>
            {updating ? 'Updating...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}