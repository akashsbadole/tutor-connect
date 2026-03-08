import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X, Plus } from "lucide-react";

const subjectList = [
  { name: "Mathematics" }, { name: "English" }, { name: "Physics" },
  { name: "Chemistry" }, { name: "Biology" }, { name: "Computer Science" },
  { name: "Music" }, { name: "Languages" }, { name: "History" },
  { name: "Geography" }, { name: "Art" }, { name: "Economics" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const tutorSchema = z.object({
  fullName: z.string().trim().min(1, "Required").max(100),
  bio: z.string().trim().min(10, "At least 10 characters").max(1000),
  location: z.string().trim().min(1, "Required").max(100),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  hourlyRate: z.coerce.number().min(1, "Must be at least $1").max(500),
  experienceYears: z.coerce.number().min(0).max(50),
  qualifications: z.string().trim().max(1000),
});

const studentSchema = z.object({
  fullName: z.string().trim().min(1, "Required").max(100),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().max(100).optional(),
});

type TutorValues = z.infer<typeof tutorSchema>;
type StudentValues = z.infer<typeof studentSchema>;

interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

const AvailabilityEditor = ({ slots, onChange }: { slots: TimeSlot[]; onChange: (s: TimeSlot[]) => void }) => {
  const [day, setDay] = useState("Mon");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("12:00");

  const addSlot = () => {
    if (start >= end) return;
    const label = `${day} ${start}-${end}`;
    if (slots.some((s) => `${s.day} ${s.start}-${s.end}` === label)) return;
    onChange([...slots, { day, start, end }]);
  };

  const removeSlot = (idx: number) => onChange(slots.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Weekly Availability</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-primary bg-accent px-3 py-1 text-sm text-accent-foreground">
            {s.day} {s.start}-{s.end}
            <button type="button" onClick={() => removeSlot(i)} className="ml-1 text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {slots.length === 0 && <p className="text-sm text-muted-foreground">No slots added yet</p>}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Day</label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Start</label>
          <Select value={start} onValueChange={setStart}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">End</label>
          <Select value={end} onValueChange={setEnd}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSlot} className="gap-1">
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
    </div>
  );
};

const ProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  const roleType = profile?.role_type || (user?.user_metadata?.role_type as "student" | "tutor") || "student";
  const isTutor = roleType === "tutor";

  const tutorForm = useForm<TutorValues>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      fullName: profile?.full_name || user?.user_metadata?.full_name || "",
      bio: "",
      location: "",
      subjects: [],
      hourlyRate: 25,
      experienceYears: 1,
      qualifications: "",
    },
  });

  const studentForm = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: profile?.full_name || user?.user_metadata?.full_name || "",
      bio: "",
      location: "",
    },
  });

  const selectedSubjects = tutorForm.watch("subjects") || [];

  const toggleSubject = (name: string) => {
    const current = tutorForm.getValues("subjects");
    tutorForm.setValue(
      "subjects",
      current.includes(name) ? current.filter((s) => s !== name) : [...current, name],
      { shouldValidate: true }
    );
  };

  const handleTutorSubmit = async (values: TutorValues) => {
    if (!user) return;
    setSubmitting(true);

    const qualifications = values.qualifications
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);

    const availabilityStrings = availability.map((s) => `${s.day} ${s.start}-${s.end}`);

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        bio: values.bio,
        location: values.location,
        role_type: "tutor",
        profile_completed: true,
      })
      .eq("user_id", user.id);

    const { error: tutorErr } = await supabase.from("tutor_profiles").upsert({
      user_id: user.id,
      subjects: values.subjects,
      hourly_rate: values.hourlyRate,
      experience_years: values.experienceYears,
      qualifications,
      availability: availabilityStrings,
    });

    setSubmitting(false);
    if (profileErr || tutorErr) {
      toast({ title: "Error", description: (profileErr || tutorErr)?.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile complete!" });
      navigate("/dashboard");
    }
  };

  const handleStudentSubmit = async (values: StudentValues) => {
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        bio: values.bio || null,
        location: values.location || null,
        role_type: "student",
        profile_completed: true,
      })
      .eq("user_id", user.id);

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile complete!" });
      navigate("/dashboard");
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-serif text-3xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            {isTutor ? "Set up your tutor profile so students can find you." : "Tell us a bit about yourself."}
          </p>

          {isTutor ? (
            <Form {...tutorForm}>
              <form onSubmit={tutorForm.handleSubmit(handleTutorSubmit)} className="mt-8 space-y-6">
                <FormField control={tutorForm.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={tutorForm.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea rows={4} placeholder="Tell students about yourself..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={tutorForm.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="e.g. New York, NY" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={tutorForm.control} name="subjects" render={() => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {subjectList.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => toggleSubject(s.name)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            selectedSubjects.includes(s.name)
                              ? "border-primary bg-accent text-accent-foreground"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {s.name}
                          {selectedSubjects.includes(s.name) && <X className="ml-1 inline h-3 w-3" />}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField control={tutorForm.control} name="hourlyRate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl><Input type="number" min={1} max={500} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={tutorForm.control} name="experienceYears" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl><Input type="number" min={0} max={50} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={tutorForm.control} name="qualifications" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications (one per line)</FormLabel>
                    <FormControl><Textarea rows={3} placeholder="M.Sc. Mathematics&#10;Certified Teacher..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <AvailabilityEditor slots={availability} onChange={setAvailability} />

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Complete Profile"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...studentForm}>
              <form onSubmit={studentForm.handleSubmit(handleStudentSubmit)} className="mt-8 space-y-6">
                <FormField control={studentForm.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={studentForm.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>About You (optional)</FormLabel>
                    <FormControl><Textarea rows={3} placeholder="What are you looking to learn?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={studentForm.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (optional)</FormLabel>
                    <FormControl><Input placeholder="e.g. New York, NY" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Complete Profile"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSetup;
