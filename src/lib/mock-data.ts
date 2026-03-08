export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  experience: number;
  bio: string;
  location: string;
  availability: string[];
  qualifications: string[];
  studentsCount: number;
  lessonsCount: number;
}

export interface Review {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
  subject: string;
}

export const subjects = [
  { name: "Mathematics", icon: "📐", count: 342 },
  { name: "English", icon: "📝", count: 528 },
  { name: "Physics", icon: "⚛️", count: 186 },
  { name: "Chemistry", icon: "🧪", count: 154 },
  { name: "Biology", icon: "🧬", count: 198 },
  { name: "Computer Science", icon: "💻", count: 276 },
  { name: "Music", icon: "🎵", count: 145 },
  { name: "Languages", icon: "🌍", count: 412 },
];

export const tutors: Tutor[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    subjects: ["Mathematics", "Physics"],
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 45,
    experience: 12,
    bio: "PhD in Mathematics from MIT. I specialize in making complex concepts accessible and enjoyable. My teaching philosophy centers on building strong fundamentals and developing problem-solving intuition.",
    location: "New York, USA",
    availability: ["Mon 9-12", "Tue 14-18", "Wed 9-12", "Thu 14-18", "Fri 9-15"],
    qualifications: ["PhD Mathematics - MIT", "M.Sc Physics - Stanford", "Certified Online Educator"],
    studentsCount: 89,
    lessonsCount: 1240,
  },
  {
    id: "2",
    name: "James Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    subjects: ["English", "Languages"],
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 35,
    experience: 8,
    bio: "Native English speaker with CELTA certification. I've helped over 500 students improve their English fluency through conversation-based learning and structured grammar exercises.",
    location: "London, UK",
    availability: ["Mon 10-16", "Wed 10-16", "Fri 10-16"],
    qualifications: ["MA English Literature - Oxford", "CELTA Certified", "IELTS Examiner"],
    studentsCount: 156,
    lessonsCount: 2100,
  },
  {
    id: "3",
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    subjects: ["Computer Science", "Mathematics"],
    rating: 4.9,
    reviewCount: 204,
    hourlyRate: 50,
    experience: 10,
    bio: "Former Google engineer turned educator. I teach programming, data structures, algorithms, and mathematics with real-world applications. Perfect for coding interviews and competitive programming.",
    location: "Bangalore, India",
    availability: ["Mon-Fri 18-22", "Sat 10-18"],
    qualifications: ["M.Tech CS - IIT Bombay", "Ex-Google Engineer", "3x ICPC Finalist"],
    studentsCount: 234,
    lessonsCount: 3400,
  },
  {
    id: "4",
    name: "Emily Chen",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    subjects: ["Chemistry", "Biology"],
    rating: 4.7,
    reviewCount: 68,
    hourlyRate: 40,
    experience: 6,
    bio: "Passionate about making science come alive! I use interactive experiments, visual aids, and real-world examples to help students grasp difficult concepts in chemistry and biology.",
    location: "Toronto, Canada",
    availability: ["Tue 9-15", "Thu 9-15", "Sat 10-14"],
    qualifications: ["PhD Biochemistry - UofT", "Published Researcher", "Science Communicator"],
    studentsCount: 67,
    lessonsCount: 890,
  },
  {
    id: "5",
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    subjects: ["Music"],
    rating: 5.0,
    reviewCount: 52,
    hourlyRate: 55,
    experience: 15,
    bio: "Professional musician and Berklee graduate. I teach piano, guitar, and music theory for all levels. Whether you're a complete beginner or preparing for conservatory auditions, I can help.",
    location: "Los Angeles, USA",
    availability: ["Mon-Fri 12-20"],
    qualifications: ["Berklee College of Music", "Grammy-nominated Producer", "Royal Conservatory Examiner"],
    studentsCount: 45,
    lessonsCount: 670,
  },
  {
    id: "6",
    name: "Aisha Patel",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    subjects: ["Physics", "Mathematics"],
    rating: 4.8,
    reviewCount: 115,
    hourlyRate: 42,
    experience: 9,
    bio: "I believe every student can excel in physics and math with the right approach. My methods combine visual learning, step-by-step problem solving, and exam-focused preparation.",
    location: "Mumbai, India",
    availability: ["Mon-Sat 16-22"],
    qualifications: ["M.Sc Physics - IISc", "10+ years teaching", "IIT-JEE Mentor"],
    studentsCount: 178,
    lessonsCount: 2800,
  },
];

export const reviews: Review[] = [
  {
    id: "1",
    studentName: "Alex Thompson",
    studentAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Dr. Mitchell transformed my understanding of calculus. I went from barely passing to getting an A in my college course!",
    date: "2 weeks ago",
    subject: "Mathematics",
  },
  {
    id: "2",
    studentName: "Maria Garcia",
    studentAvatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "James is an incredible English tutor. My IELTS score improved by 2 bands in just 3 months of lessons!",
    date: "1 month ago",
    subject: "English",
  },
  {
    id: "3",
    studentName: "Raj Kumar",
    studentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Priya's teaching on data structures helped me crack my Google interview. Highly recommend for anyone in tech!",
    date: "3 weeks ago",
    subject: "Computer Science",
  },
];

export const stats = [
  { label: "Active Tutors", value: "2,500+" },
  { label: "Students Taught", value: "50,000+" },
  { label: "Lessons Completed", value: "500,000+" },
  { label: "Average Rating", value: "4.8★" },
];
