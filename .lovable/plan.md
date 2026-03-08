

# Implementation Plan: Missing Features

## 1. Database Trigger — Auto-create profile on signup
Create migration to attach `handle_new_user` trigger to `auth.users` and update the function to include `role_type` from signup metadata.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, role_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE WHEN NEW.raw_user_meta_data->>'role_type' IN ('student','tutor')
      THEN (NEW.raw_user_meta_data->>'role_type')::user_role_type
      ELSE NULL END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2. Fix ProfileSetup — Remove mock data import
Replace `import { subjects as subjectList } from "@/lib/mock-data"` with a local constant:
```ts
const subjectList = [
  { name: "Mathematics" }, { name: "English" }, { name: "Physics" },
  { name: "Chemistry" }, { name: "Biology" }, { name: "Computer Science" },
  { name: "Music" }, { name: "Languages" },
];
```

## 3. Delete `src/lib/mock-data.ts`

## 4. Add Tutor Availability Editor to ProfileSetup
Add a section in the tutor form with:
- Day select dropdown (Mon-Sun)
- Start time and end time inputs
- Add/remove slots, stored as string array (e.g. `["Mon 09:00-12:00"]`) in `tutor_profiles.availability`

## 5. Add Review Submission on Dashboard
For students, on past bookings with status `completed` that don't have a review yet:
- Show a "Leave Review" button
- Opens a Dialog with 1-5 star rating selector and optional comment textarea
- Inserts into `reviews` table with `booking_id`, `tutor_id`, `student_id`, `rating`, `comment`
- Fetch existing reviews for the user's completed bookings to know which ones already have reviews

## 6. Fix Dashboard Stats
- **Tutor earnings**: Sum from confirmed/completed bookings joined with `tutor_profiles.hourly_rate` and `duration_minutes`
- **Student reviews given**: Count from `reviews` table where `student_id = user.id`
- **Messages**: Count unread messages from `messages` table

## 7. Fix "Become a Tutor" CTA
Wrap the button on Index.tsx line 318 with `<Link to="/auth">`.

## Files Changed
| File | Change |
|------|--------|
| `src/pages/ProfileSetup.tsx` | Remove mock import, add local subjects, add availability editor UI |
| `src/pages/Dashboard.tsx` | Add review dialog, fetch real stats (earnings, reviews, unread messages) |
| `src/pages/Index.tsx` | Link "Become a Tutor" button to `/auth` |
| `src/lib/mock-data.ts` | Delete |
| Database migration | Create trigger + update `handle_new_user` function |

