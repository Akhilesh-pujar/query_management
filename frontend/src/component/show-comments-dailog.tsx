import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { CommentTimeline } from "./comment-timeline";
  import { MessageSquare } from "lucide-react";
  
  interface ShowCommentsDialogProps {
    queryNumber: string;
    comments: any[];
  }
  
  export function ShowCommentsDialog({ queryNumber, comments }: ShowCommentsDialogProps) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Show Comments
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Comments for Query {queryNumber}</DialogTitle>
          </DialogHeader>
          <CommentTimeline comments={comments} />
        </DialogContent>
      </Dialog>
    );
  }