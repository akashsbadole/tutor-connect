import { Link } from "react-router-dom";
import { Search, ArrowRight, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TutorCard from "@/components/TutorCard";
import heroImage from "@/assets/hero-tutoring.jpg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { TutorWithProfile } from "@/pages/SearchTutors";

const subjectIcons: Record<string, string> = {
  Mathematics: "📐", English: "📝", Physics: "⚛️", Chemistry: "🧪",
  Biology: "🧬", "Computer Science": "💻", Music: "🎵", Languages: "🌍",
  History: "📜", Geography: "🌎", Art: "🎨", Economics: "📊",
};

interface HomeReview {
  id: string;
  rating: number;
  comment: string | null;
  student_name: string;
  student_avatar: string | null;
  subject: string;
}

interface SubjectInfo {
  name: string;
  icon: string;
  count: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredTutors, setFeaturedTutors] = useState<TutorWithProfile[]>([]);
  const [subjectList, setSubjectList] = useState<SubjectInfo[]>([]);
  const [homeReviews, setHomeReviews] = useState<HomeReview[]>([]);
  const [homeStats, setHomeStats] = useState([
    { label: "Active Tutors", value: "0" },
    { label: "Students Taught", value: "0" },
    { label: "Lessons Completed", value: "0" },
    { label: "Average Rating", value: "—" },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      // Featured tutors
      const { data: tps } = await supabase.from("tutor_profiles").select("*").limit(3);
      const allTps = tps || [];
      const userIds = allTps.map((t) => t.user_id);
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("user_id, full_name, avatar_url, bio, location").in("user_id", userIds)
        : { data: [] };
      const { data: reviewData } = userIds.length
        ? await supabase.from("reviews").select("tutor_id, rating").in("tutor_id", userIds)
        : { data: [] };
      const reviewMap = new Map<string, { total: number; count: number }>();
      (reviewData || []).forEach((r) => { const e = reviewMap.get(r.tutor_id) || { total: 0, count: 0 }; e.total += r.rating; e.count++; reviewMap.set(r.tutor_id, e); });
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      setFeaturedTutors(allTps.map((tp) => {
        const p = profileMap.get(tp.user_id);
        const ri = reviewMap.get(tp.user_id);
        return { user_id: tp.user_id, full_name: p?.full_name || "Unknown", avatar_url: p?.avatar_url || null, bio: p?.bio || null, location: p?.location || null, subjects: tp.subjects, hourly_rate: Number(tp.hourly_rate), experience_years: tp.experience_years, students_count: tp.students_count, lessons_count: tp.lessons_count, qualifications: tp.qualifications, availability: tp.availability, rating: ri ? Math.round((ri.total / ri.count) * 10) / 10 : 0, review_count: ri?.count || 0 };
      }));

      // Subjects from all tutor profiles
      const { data: allTutors } = await supabase.from("tutor_profiles").select("subjects");
      const subjectCounts = new Map<string, number>();
      (allTutors || []).forEach((t) => t.subjects.forEach((s) => subjectCounts.set(s, (subjectCounts.get(s) || 0) + 1)));
      setSubjectList(
        Array.from(subjectCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => ({ name, icon: subjectIcons[name] || "📚", count }))
      );

      // Stats
      const tutorCount = allTutors?.length || 0;
      const totalStudents = (allTutors || []).reduce((sum, t) => sum + ((t as any).students_count || 0), 0);
      const totalLessons = (allTutors || []).reduce((sum, t) => sum + ((t as any).lessons_count || 0), 0);
      // Need full tutor data for stats
      const { data: fullTutors } = await supabase.from("tutor_profiles").select("students_count, lessons_count");
      const realStudents = (fullTutors || []).reduce((s, t) => s + t.students_count, 0);
      const realLessons = (fullTutors || []).reduce((s, t) => s + t.lessons_count, 0);
      const { data: allReviews } = await supabase.from("reviews").select("rating");
      const avgRating = allReviews && allReviews.length > 0
        ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
        : "—";
      setHomeStats([
        { label: "Active Tutors", value: tutorCount > 0 ? `${tutorCount}` : "0" },
        { label: "Students Taught", value: realStudents > 0 ? realStudents.toLocaleString() : "0" },
        { label: "Lessons Completed", value: realLessons > 0 ? realLessons.toLocaleString() : "0" },
        { label: "Average Rating", value: avgRating !== "—" ? `${avgRating}★` : "—" },
      ]);

      // Recent reviews for testimonials
      const { data: recentReviews } = await supabase
        .from("reviews")
        .select("id, rating, comment, student_id, tutor_id")
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);
      if (recentReviews && recentReviews.length > 0) {
        const sIds = [...new Set(recentReviews.map((r) => r.student_id))];
        const tIds = [...new Set(recentReviews.map((r) => r.tutor_id))];
        const { data: sProfiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", sIds);
        const { data: tProfiles } = await supabase.from("tutor_profiles").select("user_id, subjects").in("user_id", tIds);
        const sMap = new Map((sProfiles || []).map((p) => [p.user_id, p]));
        const tMap = new Map((tProfiles || []).map((p) => [p.user_id, p]));
        setHomeReviews(recentReviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          student_name: sMap.get(r.student_id)?.full_name || "Student",
          student_avatar: sMap.get(r.student_id)?.avatar_url || null,
          subject: tMap.get(r.tutor_id)?.subjects?.[0] || "General",
        })));
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-warm opacity-80" />
        <div className="container relative py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                Trusted by 50,000+ students worldwide
              </div>
              <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                Find the perfect <span className="text-gradient-primary">tutor</span> for you
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Connect with expert tutors in any subject. Personalized 1-on-1 lessons that fit your schedule and learning goals.
              </p>

              <form onSubmit={handleSearch} className="mt-8 flex max-w-md gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by subject, name, or topic..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
                <span>Popular:</span>
                {["Math", "English", "Physics", "Coding"].map((s) => (
                  <Link
                    key={s}
                    to={`/search?q=${s}`}
                    className="rounded-full border border-border px-3 py-1 transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden lg:block" style={{ animationDelay: "0.2s" }}>
              <div className="animate-fade-in relative">
                <img
                  src={heroImage}
                  alt="Student and tutor learning together"
                  className="rounded-2xl shadow-elevated"
                />
                <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {featuredTutors.slice(0, 3).map((t) => (
                        <div key={t.user_id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-xs font-bold text-primary overflow-hidden">
                          {t.avatar_url ? <img src={t.avatar_url} alt="" className="h-full w-full object-cover" /> : t.full_name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">2,500+ tutors</p>
                      <p className="text-xs text-muted-foreground">Ready to help you learn</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card py-10">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {homeStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-2xl font-bold text-foreground md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">Browse by Subject</h2>
            <p className="mt-2 text-muted-foreground">Explore tutors across all subjects and skill levels</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {subjects.map((subject) => (
              <Link
                key={subject.name}
                to={`/search?q=${subject.name}`}
                className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
              >
                <span className="text-3xl">{subject.icon}</span>
                <h3 className="mt-3 font-semibold text-card-foreground">{subject.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{subject.count} tutors</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="bg-muted/30 py-16 lg:py-20">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Featured Tutors</h2>
              <p className="mt-2 text-muted-foreground">Top-rated tutors recommended for you</p>
            </div>
            <Link to="/search" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              View all tutors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredTutors.map((tutor) => (
              <TutorCard key={tutor.user_id} tutor={tutor} />
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link to="/search">
              <Button variant="outline">View all tutors</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground">What Students Say</h2>
            <p className="mt-2 text-muted-foreground">Real stories from our community</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-rating text-rating" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-card-foreground">&ldquo;{review.comment}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <img src={review.studentAvatar} alt={review.studentName} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{review.studentName}</p>
                    <p className="text-xs text-muted-foreground">{review.subject} student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="rounded-2xl bg-primary px-8 py-14 text-center shadow-elevated">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to start learning?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Join thousands of students achieving their goals with personalized tutoring.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/search">
                <Button size="lg" variant="secondary">Find a Tutor</Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Become a Tutor
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
