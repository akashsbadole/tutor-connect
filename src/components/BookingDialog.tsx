import { useState } from "react";
import { format, addHours } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface BookingDialogProps {
  tutorId: string;
  tutorName: string;
  hourlyRate: number;
  availability: string[];
  children: React.ReactNode;
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return [`${h}:00`, `${h}:30`];
}).flat();

const durations = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const BookingDialog = ({ tutorId, tutorName, hourlyRate, availability, children }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalCost = (Number(duration) / 60) * hourlyRate;

  const handleBook = async () => {
    if (!user) {
      toast.error("Please sign in to book a lesson");
      navigate("/auth");
      return;
    }
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    if (user.id === tutorId) {
      toast.error("You can't book a lesson with yourself");
      return;
    }

    setSubmitting(true);
    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + Number(duration) * 60 * 1000);

    if (startTime <= new Date()) {
      toast.error("Please select a future date and time");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      student_id: user.id,
      tutor_id: tutorId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: Number(duration),
      notes: notes.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error("Failed to book lesson. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Lesson booked! The tutor will confirm shortly.");
    setOpen(false);
    setDate(undefined);
    setTime("");
    setDuration("60");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Book a Lesson with {tutorName}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Availability hint */}
          {availability.length > 0 && (
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Available times</p>
              <p className="mt-1 text-sm text-card-foreground">{availability.join(" · ")}</p>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.filter((_, i) => i >= 14 && i <= 44).map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="What would you like to focus on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>${hourlyRate}/hr × {Number(duration) / 60}h</p>
            </div>
          </div>

          <Button onClick={handleBook} disabled={submitting || !date || !time} className="w-full" size="lg">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            {submitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
