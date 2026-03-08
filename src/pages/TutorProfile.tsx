import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star, MapPin, BookOpen, Clock, Award, ArrowLeft, Users, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import BookingDialog from "@/components/BookingDialog";

interface TutorData {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  subjects: string[];
  hourly_rate: number;
  experience_years: number;
  students_count: number;
  lessons_count: number;
  qualifications: string[];
  availability: string[];
  rating: number;
  review_count: number;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_name: string;
  student_avatar: string | null;
}

const TutorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTutor = async () => {
      setLoading(true);
      const { data: tp } = await supabase
        .from("tutor_profiles")
        .select("*")
        .eq("user_id", id)
        .single();

      if (!tp) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, location")
        .eq("user_id", id)
        .single();

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("tutor_id", id)
        .order("created_at", { ascending: false });

      let reviewsWithNames: ReviewData[] = [];
      if (reviewData && reviewData.length > 0) {
        const studentIds = [...new Set(reviewData.map((r) => r.student_id))];
        const { data: studentProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", studentIds);
        const spMap = new Map((studentProfiles || []).map((p) => [p.user_id, p]));
        reviewsWithNames = reviewData.map((r) => {
          const sp = spMap.get(r.student_id);
          return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            student_name: sp?.full_name || "Anonymous",
            student_avatar: sp?.avatar_url || null,
          };
        });
      }

      const totalRating = reviewsWithNames.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviewsWithNames.length ? Math.round((totalRating / reviewsWithNames.length) * 10) / 10 : 0;

      const availability = Array.isArray(tp.availability) ? (tp.availability as string[]) : [];

      setTutor({
        user_id: tp.user_id,
        full_name: profile?.full_name || "Unknown Tutor",
        avatar_url: profile?.avatar_url || null,
        bio: profile?.bio || null,
        location: profile?.location || null,
        subjects: tp.subjects,
        hourly_rate: Number(tp.hourly_rate),
        experience_years: tp.experience_years,
        students_count: tp.students_count,
        lessons_count: tp.lessons_count,
        qualifications: tp.qualifications,
        availability,
        rating: avgRating,
        review_count: reviewsWithNames.length,
      });
      setReviews(reviewsWithNames);
      setLoading(false);
    };
    fetchTutor();
  }, [id]);

  const handleMessage = () => {
    if (user?.id === id) {
      toast.error("You can't message yourself");
      return;
    }
    // Navigation handled by Link, this is for the self-check only
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="font-serif text-2xl font-bold">Tutor not found</p>
          <Link to="/search"><Button className="mt-4">Browse Tutors</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSelf = user?.id === tutor.user_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <Link to="/search" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary ring-4 ring-accent overflow-hidden">
                  {tutor.avatar_url ? (
                    <img src={tutor.avatar_url} alt={tutor.full_name} className="h-full w-full object-cover" />
                  ) : (
                    tutor.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-serif text-2xl font-bold text-card-foreground">{tutor.full_name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {tutor.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{tutor.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{tutor.experience_years} years exp.</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-rating text-rating" />
                      <span className="font-semibold text-card-foreground">{tutor.rating || "New"}</span>
                      ({tutor.review_count} reviews)
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tutor.subjects.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                </div>
              </div>
            </div>

            {tutor.bio && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-serif text-xl font-bold text-card-foreground">About</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{tutor.bio}</p>
              </div>
            )}

            {tutor.qualifications.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-serif text-xl font-bold text-card-foreground">Qualifications</h2>
                <ul className="mt-3 space-y-2">
                  {tutor.qualifications.map((q) => (
                    <li key={q} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4 text-primary" />{q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-serif text-xl font-bold text-card-foreground">Reviews</h2>
                <div className="mt-4 space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary overflow-hidden">
                          {review.student_avatar ? (
                            <img src={review.student_avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            review.student_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-card-foreground">{review.student_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1 flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-rating text-rating" />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="text-center">
                  <span className="font-serif text-3xl font-bold text-card-foreground">${tutor.hourly_rate}</span>
                  <span className="text-muted-foreground">/hour</span>
                </div>
                {!isSelf ? (
                  <BookingDialog
                    tutorId={tutor.user_id}
                    tutorName={tutor.full_name}
                    hourlyRate={tutor.hourly_rate}
                    availability={tutor.availability}
                  >
                    <Button className="mt-5 w-full" size="lg">Book a Lesson</Button>
                  </BookingDialog>
                ) : (
                  <Button className="mt-5 w-full" size="lg" disabled>Book a Lesson</Button>
                )}
                {!isSelf ? (
                  <Link to={`/messages?with=${tutor.user_id}`}>
                    <Button variant="outline" className="mt-3 w-full gap-2" size="lg">
                      <MessageSquare className="h-4 w-4" /> Send Message
                    </Button>
                  </Link>
                ) : (
                  <p className="mt-3 text-center text-sm text-muted-foreground">This is your profile</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-serif text-sm font-bold text-card-foreground">Stats</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { icon: Users, label: "Students", value: tutor.students_count },
                    { icon: BookOpen, label: "Lessons", value: tutor.lessons_count },
                    { icon: Star, label: "Rating", value: tutor.rating || "New" },
                    { icon: Clock, label: "Experience", value: `${tutor.experience_years} yrs` },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <stat.icon className="h-4 w-4" /> {stat.label}
                      </span>
                      <span className="font-semibold text-card-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {tutor.availability.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="font-serif text-sm font-bold text-card-foreground">Availability</h3>
                  <ul className="mt-3 space-y-2">
                    {tutor.availability.map((slot, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-success" />
                        {String(slot)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TutorProfile;
