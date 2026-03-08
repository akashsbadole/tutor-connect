

# Messaging Flow Review & Fixes

## Issues Found

1. **TutorProfile still uses mock data** — The "Send Message" button links to `/messages?with=${tutor.id}`, but `tutor.id` comes from mock data, not real user IDs. Messages sent this way would target a non-existent user.

2. **SearchTutors also uses mock data** — Tutor cards link to mock tutor profiles, not real ones.

3. **No way to start a conversation** — Until tutor profiles are wired to real data, there's no valid path to initiate a message with a real user.

## Plan

### Step 1: Wire SearchTutors to real data
- Query `tutor_profiles` joined with `profiles` from the database
- Display real tutors with their actual `user_id`
- Link tutor cards to `/tutor/:user_id`

### Step 2: Wire TutorProfile to real data
- Fetch tutor by `user_id` from `tutor_profiles` + `profiles`
- Fetch real reviews from `reviews` table
- "Send Message" button uses the real `user_id`

### Step 3: Minor messaging fixes
- Handle edge case: navigating to `/messages?with=<id>` when no prior conversation exists (currently works but shows empty chat — that's fine)
- Add a toast/redirect if user tries to message themselves

### Manual Test Steps (after implementation)
1. Sign up as **User A** (tutor role), complete profile with subjects and rate
2. Sign up as **User B** (student role), complete profile
3. As User B, go to Search → find User A → click their profile → click "Send Message"
4. Type and send a message
5. Open a second browser/incognito as User A → go to `/messages` → verify the message appears
6. Reply as User A → verify it appears in real-time for User B

