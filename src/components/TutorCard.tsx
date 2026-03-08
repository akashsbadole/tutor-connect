import { Link } from "react-router-dom";
import { Star, MapPin, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tutor } from "@/lib/mock-data";

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="flex gap-4">
        <img
          src={tutor.avatar}
          alt={tutor.name}
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/tutor/${tutor.id}`}
                className="font-serif text-lg font-bold text-card-foreground transition-colors hover:text-primary"
              >
                {tutor.name}
              </Link>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {tutor.location}
              </div>
            </div>
            <div className="text-right">
              <span className="font-serif text-xl font-bold text-foreground">${tutor.hourlyRate}</span>
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tutor.subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {tutor.bio}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-rating text-rating" />
                <span className="font-semibold text-foreground">{tutor.rating}</span>
                <span className="text-muted-foreground">({tutor.reviewCount})</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                {tutor.lessonsCount} lessons
              </span>
            </div>
            <Link to={`/tutor/${tutor.id}`}>
              <Button size="sm" variant="outline" className="transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
