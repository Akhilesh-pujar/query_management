import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  comment: string;
  status: string;
  updated_by__email: string;
  created_at: string;
}

interface CommentTimelineProps {
  comments: Comment[];
}

export function CommentTimeline({ comments }: CommentTimelineProps) {
  return (
    <ScrollArea className="h-[300px] w-full pr-4">
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="flex gap-4 relative">
            <div className="w-[2px] bg-border absolute left-2 top-10 bottom-0" />
            <div className="w-4 h-4 rounded-full bg-primary mt-2 relative z-10" />
            <div className="flex-1 bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{comment.updated_by__email}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm mb-2">{comment.comment}</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                {comment.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}