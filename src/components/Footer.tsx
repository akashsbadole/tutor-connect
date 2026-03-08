import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-muted/50 py-12">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-bold">TutorHub</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Connecting students with expert tutors worldwide for personalized learning.
          </p>
        </div>
        {[
          { title: "For Students", links: ["Find a Tutor", "How It Works", "Pricing"] },
          { title: "For Tutors", links: ["Become a Tutor", "Resources", "Success Stories"] },
          { title: "Company", links: ["About Us", "Careers", "Contact"] },
        ].map((section) => (
          <div key={section.title}>
            <h4 className="font-serif text-sm font-bold text-foreground">{section.title}</h4>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © 2026 TutorHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
