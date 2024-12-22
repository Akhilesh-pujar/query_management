import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommentFormData, Query, Status } from "@/types/query";
import { useState } from "react";

interface QueryCommentsProps {
  query: Query;
  onAddComment: (data: CommentFormData) => Promise<void>;
}

export function QueryComments({ query, onAddComment }: QueryCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CommentFormData>({
    query_number: query.queryNumber,
    comment: '',
    updated_by: localStorage.getItem('email') || '',
    status: query.status,
  });

  const handleSubmit = async () => {
    try {
      await onAddComment(formData);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Comment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Comment to Query: {query.queryNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="updated_by">Updated By:</label>
            <Input
              id="updated_by"
              value={formData.updated_by}
              className="col-span-3"
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                updated_by: e.target.value,
              }))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status">Status:</label>
            <Select
              onValueChange={(value) => setFormData((prev) => ({ 
                ...prev, 
                status: value as Status 
              }))}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="comment">Comment:</label>
            <Textarea
              id="comment"
              value={formData.comment}
              className="col-span-3"
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                comment: e.target.value 
              }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}