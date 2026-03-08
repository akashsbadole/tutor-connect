import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TutorCard from "@/components/TutorCard";
import { supabase } from "@/integrations/supabase/client";

export interface TutorWithProfile {
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
  availability: unknown;
  rating: number;
  review_count: number;
}

const SearchTutors = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [tutors, setTutors] = useState<TutorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      const { data: tutorProfiles } = await supabase
        .from("tutor_profiles")
        .select("*");

      if (!tutorProfiles || tutorProfiles.length === 0) {
        setTutors([]);
        setLoading(false);
        return;
      }

      const userIds = tutorProfiles.map((t) => t.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, bio, location")
        .in("user_id", userIds);

      // Fetch review stats
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("tutor_id, rating");

      const reviewMap = new Map<string, { total: number; count: number }>();
      (reviewData || []).forEach((r) => {
        const entry = reviewMap.get(r.tutor_id) || { total: 0, count: 0 };
        entry.total += r.rating;
        entry.count += 1;
        reviewMap.set(r.tutor_id, entry);
      });

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const subjects = new Set<string>();
      const merged: TutorWithProfile[] = tutorProfiles.map((tp) => {
        const profile = profileMap.get(tp.user_id);
        const reviewInfo = reviewMap.get(tp.user_id);
        tp.subjects.forEach((s) => subjects.add(s));
        return {
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
          availability: tp.availability,
          rating: reviewInfo ? Math.round((reviewInfo.total / reviewInfo.count) * 10) / 10 : 0,
          review_count: reviewInfo?.count || 0,
        };
      });

      setAllSubjects(Array.from(subjects).sort());
      setTutors(merged);
      setLoading(false);
    };
    fetchTutors();
  }, []);

  const filtered = useMemo(() => {
    let result = [...tutors];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.full_name.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q)) ||
          (t.bio && t.bio.toLowerCase().includes(q))
      );
    }
    if (selectedSubject && selectedSubject !== "all") {
      result = result.filter((t) => t.subjects.includes(selectedSubject));
    }
    result = result.filter(
      (t) => t.hourly_rate >= priceRange[0] && t.hourly_rate <= priceRange[1]
    );
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "price-low") result.sort((a, b) => a.hourly_rate - b.hourly_rate);
    else if (sortBy === "price-high") result.sort((a, b) => b.hourly_rate - a.hourly_rate);
    else if (sortBy === "experience") result.sort((a, b) => b.experience_years - a.experience_years);
    return result;
  }, [query, selectedSubject, priceRange, sortBy, tutors]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tutors by name, subject, or keyword..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {allSubjects.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}/hr
                </label>
                <Slider min={0} max={200} step={5} value={priceRange} onValueChange={setPriceRange} className="mt-3" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{filtered.length} tutors found</span>
          {query && (
            <Badge variant="secondary" className="gap-1">
              &ldquo;{query}&rdquo;
              <X className="h-3 w-3 cursor-pointer" onClick={() => setQuery("")} />
            </Badge>
          )}
          {selectedSubject && selectedSubject !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedSubject}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubject("all")} />
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-muted-foreground">Loading tutors...</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {filtered.map((tutor) => (
                <TutorCard key={tutor.user_id} tutor={tutor} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-serif text-2xl font-bold text-foreground">No tutors found</p>
                <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
                <Button className="mt-4" onClick={() => { setQuery(""); setSelectedSubject("all"); setPriceRange([0, 200]); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchTutors;
