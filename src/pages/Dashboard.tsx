import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, BookOpen, Users, Clock, DollarSign, Star, MessageSquare, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;

interface BookingWithPartner extends Booking {
  partner_name: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const isTutor = profile?.role_type === "tutor";
  const [bookings, setBookings] = useState<BookingWithPartner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    const col = isTutor ? "tutor_id" : "student_id";
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq(col, user.id)
      .order("start_time", { ascending: true })
      .limit(20);

    if (!data || data.length === 0) {
      setBookings([]);
      setLoading(false);
      return;
    }

    // Fetch partner names
    const partnerCol = isTutor ? "student_id" : "tutor_id";
    const partnerIds = [...new Set(data.map((b) => b[partnerCol]))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", partnerIds);
    const nameMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name || "Unknown"]));

    setBookings(
      data.map((b) => ({
        ...b,
        partner_name: nameMap.get(b[partnerCol]) || "Unknown",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user, isTutor]);

  const updateStatus = async (bookingId: string, status: "confirmed" | "canceled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);
    if (error) {
      toast.error("Failed to update booking");
      return;
    }
    toast.success(status === "confirmed" ? "Booking confirmed!" : "Booking canceled");
    fetchBookings();
  };

  const upcoming = bookings.filter((b) => new Date(b.start_time) > new Date() && b.status !== "canceled");
  const past = bookings.filter((b) => new Date(b.start_time) <= new Date() || b.status === "completed" || b.status === "canceled");

  const statusColor: Record<string, string> = {
    pending: "bg-rating/20 text-rating",
    confirmed: "bg-success/20 text-success",
    completed: "bg-primary/20 text-primary",
    canceled: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || "there"}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isTutor ? "Manage your tutoring business" : "Track your learning journey"}
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: "Upcoming", value: upcoming.length, color: "text-primary" },
            { icon: BookOpen, label: "Total Lessons", value: bookings.length, color: "text-secondary" },
            { icon: isTutor ? DollarSign : Star, label: isTutor ? "Earnings" : "Reviews Given", value: isTutor ? "$0" : "0", color: "text-success" },
            { icon: MessageSquare, label: "Messages", value: "—", color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-accent p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-card-foreground">Upcoming Lessons</h2>
              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
              ) : upcoming.length === 0 ? (
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">No upcoming lessons</p>
                  {!isTutor && (
                    <Link to="/search"><Button className="mt-3">Find a Tutor</Button></Link>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {isTutor ? "Student" : "Tutor"}: {b.partner_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(b.start_time).toLocaleDateString()} at{" "}
                          {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" · "}{b.duration_minutes} min
                        </p>
                        {b.notes && <p className="mt-1 text-xs text-muted-foreground italic">{b.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColor[b.status]}>{b.status}</Badge>
                        {isTutor && b.status === "pending" && (
                          <>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => updateStatus(b.id, "confirmed")}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "canceled")}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isTutor && b.status === "pending" && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(b.id, "canceled")}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {past.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-serif text-xl font-bold text-card-foreground">Past Lessons</h2>
                <div className="mt-4 space-y-3">
                  {past.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{b.partner_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(b.start_time).toLocaleDateString()} · {b.duration_minutes} min
                        </p>
                      </div>
                      <Badge className={statusColor[b.status]}>{b.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-serif text-sm font-bold text-card-foreground">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                {isTutor ? (
                  <>
                    <Link to="/profile-setup" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" /> Edit Profile
                      </Button>
                    </Link>
                    <Link to="/messages" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <MessageSquare className="h-4 w-4" /> Messages
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/search" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BookOpen className="h-4 w-4" /> Find Tutors
                      </Button>
                    </Link>
                    <Link to="/messages" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <MessageSquare className="h-4 w-4" /> Messages
                      </Button>
                    </Link>
                    <Link to="/profile-setup" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" /> Edit Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-serif text-sm font-bold text-card-foreground">Profile</h3>
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-card-foreground">{profile?.full_name}</p>
                <p className="capitalize text-muted-foreground">{profile?.role_type}</p>
                {profile?.location && <p className="text-muted-foreground">{profile.location}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
