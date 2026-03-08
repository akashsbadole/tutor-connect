import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, BookOpen, Users, Clock, DollarSign, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;

const Dashboard = () => {
  const { user, profile } = useAuth();
  const isTutor = profile?.role_type === "tutor";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const col = isTutor ? "tutor_id" : "student_id";
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq(col, user.id)
        .order("start_time", { ascending: true })
        .limit(10);
      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();
  }, [user, isTutor]);

  const upcoming = bookings.filter((b) => new Date(b.start_time) > new Date() && b.status !== "canceled");
  const past = bookings.filter((b) => new Date(b.start_time) <= new Date() || b.status === "completed");

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

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: "Upcoming", value: upcoming.length, color: "text-primary" },
            { icon: BookOpen, label: "Total Lessons", value: bookings.length, color: "text-secondary" },
            { icon: isTutor ? DollarSign : Star, label: isTutor ? "Earnings" : "Reviews Given", value: isTutor ? "$0" : "0", color: "text-success" },
            { icon: MessageSquare, label: "Messages", value: "0", color: "text-primary" },
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
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-card-foreground">Upcoming Lessons</h2>
              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
              ) : upcoming.length === 0 ? (
                <div className="mt-6 text-center">
                  <p className="text-muted-foreground">No upcoming lessons</p>
                  {!isTutor && (
                    <Link to="/search">
                      <Button className="mt-3">Find a Tutor</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {new Date(b.start_time).toLocaleDateString()} at{" "}
                          {new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-muted-foreground">{b.duration_minutes} min</p>
                      </div>
                      <Badge className={statusColor[b.status]}>{b.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Lessons */}
            {past.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-serif text-xl font-bold text-card-foreground">Past Lessons</h2>
                <div className="mt-4 space-y-3">
                  {past.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {new Date(b.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{b.duration_minutes} min</p>
                      </div>
                      <Badge className={statusColor[b.status]}>{b.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Clock className="h-4 w-4" /> Manage Availability
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/search" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BookOpen className="h-4 w-4" /> Find Tutors
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
                <p className="text-card-foreground font-medium">{profile?.full_name}</p>
                <p className="text-muted-foreground capitalize">{profile?.role_type}</p>
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
