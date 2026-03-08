import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TutorCard from "@/components/TutorCard";
import { tutors, subjects } from "@/lib/mock-data";

const SearchTutors = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...tutors];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q)) ||
          t.bio.toLowerCase().includes(q)
      );
    }

    if (selectedSubject && selectedSubject !== "all") {
      result = result.filter((t) => t.subjects.includes(selectedSubject));
    }

    result = result.filter(
      (t) => t.hourlyRate >= priceRange[0] && t.hourlyRate <= priceRange[1]
    );

    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "price-low") result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    else if (sortBy === "price-high") result.sort((a, b) => b.hourlyRate - a.hourlyRate);
    else if (sortBy === "experience") result.sort((a, b) => b.experience - a.experience);

    return result;
  }, [query, selectedSubject, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Search bar */}
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}/hr
                </label>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-card-foreground">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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

        {/* Active filters */}
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

        {/* Results */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl font-bold text-foreground">No tutors found</p>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
            <Button className="mt-4" onClick={() => { setQuery(""); setSelectedSubject("all"); setPriceRange([0, 100]); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchTutors;
