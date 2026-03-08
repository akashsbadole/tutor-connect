import { useParams, Link } from "react-router-dom";
import { Star, MapPin, BookOpen, Clock, Award, ArrowLeft, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { tutors, reviews } from "@/lib/mock-data";

const TutorProfile = () => {
  const { id } = useParams();
  const tutor = tutors.find((t) => t.id === id);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <Link to="/search" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-col gap-5 sm:flex-row">
                <img
                  src={tutor.avatar}
                  alt={tutor.name}
                  className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-accent"
                />
                <div className="flex-1">
                  <h1 className="font-serif text-2xl font-bold text-card-foreground">{tutor.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{tutor.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{tutor.experience} years exp.</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-rating text-rating" />
                      <span className="font-semibold text-card-foreground">{tutor.rating}</span>
                      ({tutor.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tutor.subjects.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-card-foreground">About</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{tutor.bio}</p>
            </div>

            {/* Qualifications */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-card-foreground">Qualifications</h2>
              <ul className="mt-3 space-y-2">
                {tutor.qualifications.map((q) => (
                  <li key={q} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4 text-primary" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-serif text-xl font-bold text-card-foreground">Reviews</h2>
              <div className="mt-4 space-y-5">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-3">
                      <img src={review.studentAvatar} alt={review.studentName} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-card-foreground">{review.studentName}</span>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-rating text-rating" />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="text-center">
                  <span className="font-serif text-3xl font-bold text-card-foreground">${tutor.hourlyRate}</span>
                  <span className="text-muted-foreground">/hour</span>
                </div>
                <Button className="mt-5 w-full" size="lg">Book a Lesson</Button>
                <Button variant="outline" className="mt-3 w-full gap-2" size="lg">
                  <MessageSquare className="h-4 w-4" /> Send Message
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-serif text-sm font-bold text-card-foreground">Stats</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { icon: Users, label: "Students", value: tutor.studentsCount },
                    { icon: BookOpen, label: "Lessons", value: tutor.lessonsCount },
                    { icon: Star, label: "Rating", value: tutor.rating },
                    { icon: Clock, label: "Experience", value: `${tutor.experience} yrs` },
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

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-serif text-sm font-bold text-card-foreground">Availability</h3>
                <ul className="mt-3 space-y-2">
                  {tutor.availability.map((slot) => (
                    <li key={slot} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-success" />
                      {slot}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TutorProfile;
