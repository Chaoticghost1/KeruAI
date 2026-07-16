# Database Schema

## Keru.ai Suite — PostgreSQL + Drizzle ORM

---

## 1. Entity Relationship Overview

```
users
  ├── budgetCategories (1:N)
  ├── budgetTransactions (1:N)
  ├── studyNotes (1:N)
  ├── gameScores (1:N)
  ├── authTokens (1:N)
  ├── tutorSessions (1:N)
  ├── studentProfiles (1:1)
  ├── userBadges (1:N)
  ├── studyStreaks (1:N)
  ├── contentSubmissions (1:N) [teachers]
  ├── studentAssignments (1:N) [students]
  ├── blogPosts (1:N) [authors]
  ├── classes (1:N) [teachers]
  ├── classMembers (1:N)
  ├── classChatMessages (1:N)
  └── studentTeachers (1:N) [students ↔ teachers]

tutorAgents
  └── tutorSessions (1:N)

tutorSessions
  ├── tutorMessages (1:N)
  └── tutorQaCache (1:N)

classes
  ├── classMembers (1:N)
  └── classChatMessages (1:N)

contentSubmissions
  └── studentAssignments (1:N)

badges
  └── userBadges (1:N)

botPersonas (Telegram) — separate table

mentorProfiles
  └── mentorshipRequests (1:N) [as mentor]
  └── mentorshipSessions (1:N)

mentorshipRequests
  └── mentorshipSessions (1:N)

mentorshipSessions
  └── mentorRatings (1:N)

mentorApplications — standalone (admin review)
mentorMaterials — mentorId → users; admin/teacher approval

communityPosts
  └── communityReplies (1:N)

systemSettings — key/value (feature flags, moderation)
```

---

## 2. Core Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| username | text | Unique |
| password | text | bcrypt hash |
| email | text | Unique |
| phoneNumber | text | Unique |
| role | text | student, teacher, superuser |
| isVerified | boolean | Email verification |
| verificationToken | text | |
| passwordResetToken | text | |
| passwordResetExpires | timestamp | |
| googleId, facebookId | text | OAuth (future) |
| firstName, lastName | text | |
| profileImage | text | |
| isActive | boolean | |
| lastLoginAt | timestamp | |
| createdAt, updatedAt | timestamp | |

### budgetCategories
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| name | text | |
| budget | decimal(10,2) | |
| spent | decimal(10,2) | |
| createdAt | timestamp | |

### budgetTransactions
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| categoryId | integer | FK → budgetCategories |
| description | text | |
| amount | decimal(10,2) | |
| date | timestamp | |
| createdAt | timestamp | |

### studyNotes
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| title | text | |
| content | text | |
| subject | text | |
| tags | text[] | |
| createdAt, updatedAt | timestamp | |

### gameScores
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| gameName | text | |
| score | integer | |
| level | integer | |
| completed | boolean | |
| playedAt | timestamp | |

### mathProblems (MathMaster game)
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| level | integer | 1–6 |
| topic | text | |
| questionEs, questionEn | text | |
| options | jsonb | Array of 4 choice strings |
| correctAnswer | text | |
| explanationEs, explanationEn | text | |
| category | text | |
| createdAt | timestamp | |

### languageProblems (LinguaPlay game)
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| level | integer | 1–6 |
| mode | text | vocabulary, grammar, listening, spelling, pronunciation |
| promptEs, promptEn | text | |
| options | jsonb | Array of choice strings |
| correctAnswer | text | |
| explanationEs, explanationEn | text | |
| audioUrl | text | |
| createdAt | timestamp | |

---

## 3. AI Tutoring Tables

### tutorAgents
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| agentKey | text | math_buddy, science_explorer, wordsmith_mentor |
| name | text | |
| title | text | |
| avatar | text | |
| subjects | text[] | |
| description | text | |
| isActive | boolean | |
| createdAt | timestamp | |

### tutorSessions
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| agentId | integer | FK → tutorAgents |
| subject | text | |
| topic | text | |
| difficultyLevel | integer | |
| sessionData | text | JSON |
| isActive | boolean | |
| startedAt, endedAt | timestamp | |

### tutorMessages
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| sessionId | integer | FK → tutorSessions |
| sender | text | student, agent |
| message | text | |
| messageType | text | text, hint, encouragement |
| toolsUsed | text[] | |
| timestamp | timestamp | |

### tutorQaCache
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| sessionId | integer | FK → tutorSessions |
| agentKey | text | |
| questionHash | text | For duplicate-question detection |
| studentMessage | text | |
| agentResponse | text | |
| createdAt | timestamp | |

---

## 4. Gamification Tables

### badges
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| badgeKey | text | first_session, week_warrior, etc. |
| name | text | |
| description | text | |
| icon | text | |
| category | text | streak, achievement, subject, milestone |
| rarity | text | common, rare, epic, legendary |
| requirements | text | JSON |
| points | integer | |
| isActive | boolean | |
| createdAt | timestamp | |

### userBadges
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| badgeId | integer | FK → badges |
| earnedAt | timestamp | |
| progress | integer | |
| isNew | boolean | |

### studentProfiles
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| learningStyle | text | |
| preferredDifficulty | integer | |
| subjects, strugglingAreas | text[] | |
| preferences | text | JSON (detailed preferences) |
| totalPoints | integer | |
| currentStreak, longestStreak | integer | |
| totalSessionsCompleted | integer | |
| level, experiencePoints | integer | |
| createdAt, updatedAt | timestamp | |

### studyStreaks
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| date | timestamp | |
| sessionsCompleted | integer | |
| pointsEarned | integer | |
| subjectsStudied | text[] | |

---

## 5. Content & Assignments

### contentSubmissions
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| teacherId | integer | FK → users |
| title | text | |
| description | text | |
| contentType | text | image, pdf, html, video, etc. |
| filePath, fileUrl | text | |
| contentData, htmlContent, extractedText | text | |
| subject | text | |
| difficultyLevel | integer | |
| isPublished | boolean | |
| gradeLevel | text | |
| tags | text[] | |
| viewCount | integer | |
| publishedAt | timestamp | |
| createdAt, updatedAt | timestamp | |

### studentAssignments
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| studentId | integer | FK → users |
| contentId | integer | FK → contentSubmissions |
| assignedAt, dueDate | timestamp | |
| submissionText | text | |
| submissionFiles | text[] | |
| submittedAt | timestamp | |
| grade, maxGrade | decimal | |
| feedback, teacherFeedback | text | |
| status | text | assigned, in_progress, completed, reviewed |
| gradedAt, gradedBy | timestamp/integer | |
| startedAt, completedAt | timestamp | |
| createdAt, updatedAt | timestamp | |

---

## 5b. Classes & Student–Teacher

### classes
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| teacherId | integer | FK → users |
| name | text | |
| inviteCode | text | Unique |
| subject | text | |
| status | text | active, terminated, archived, blocked |
| blockedUntil | timestamp | When status=blocked, chat resumes after |
| createdAt, updatedAt | timestamp | |

### classMembers
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| classId | integer | FK → classes |
| userId | integer | FK → users |
| role | text | student |
| status | text | pending, approved |
| canChat | boolean | false = muted |
| isBanned | boolean | |
| accessRevoked | boolean | |
| joinedAt | timestamp | |

### classChatMessages
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| classId | integer | FK → classes |
| senderId | integer | FK → users |
| message | text | |
| createdAt | timestamp | |

### classChatArchives
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| originalClassId | integer | |
| className | text | |
| teacherId | integer | FK → users |
| subject, inviteCode | text | |
| status | text | |
| archivedAt, archivedByUserId | timestamp/integer | |
| messagesSnapshot | jsonb | |
| membersSnapshot | jsonb | |

### studentTeachers
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| studentId | integer | FK → users |
| teacherId | integer | FK → users |
| createdAt | timestamp | |

---

## 6. Blog & Bot Personas

### blogPosts
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| title | text | |
| content | text | |
| excerpt | text | |
| category | text | cruises, destinations, travel-tips, reviews |
| tags | text[] | |
| authorId | integer | FK → users |
| isPublished, isHidden | boolean | |
| showOnLanding | boolean | Feature on landing page |
| publishedAt | timestamp | |
| createdAt, updatedAt | timestamp | |

### botPersonas (Telegram)
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| name | text | |
| key | text | Unique |
| description | text | |
| systemPrompt | text | |
| subjects | text[] | |
| isActive | boolean | |
| createdById | integer | FK → users |
| createdAt, updatedAt | timestamp | |

---

## 7. Mentorship Tables (Peer Mentorship for Honduras Community)

### mentorProfiles
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| subjects | text[] | Subjects offered |
| bio | text | Mentor bio |
| rating | decimal | Average rating |
| totalRatings | integer | Number of ratings |
| hoursVolunteered | integer | Volunteer hours |
| isAvailable | boolean | Available for sessions |
| isVerified | boolean | Community-verified |
| languages | text[] | e.g. ["es", "en"] |
| gradeLevel | integer | Grade level (1–12) |
| hourlyRate | decimal | Lempiras; 0 for volunteers |
| responseTime | integer | Expected response (hours) |
| createdAt, updatedAt | timestamp | |

### mentorshipRequests
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| studentId | integer | FK → users |
| mentorId | integer | FK → users |
| subject | text | |
| description | text | |
| status | text | pending, accepted, rejected, completed |
| urgency | text | low, normal, high |
| requestedAt, respondedAt, completedAt | timestamp | |

### mentorshipSessions
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| requestId | integer | FK → mentorshipRequests |
| studentId | integer | FK → users |
| mentorId | integer | FK → users |
| subject | text | |
| duration | integer | Minutes |
| sessionType | text | text, voice, video |
| notes | text | Session summary |
| status | text | scheduled, active, completed, cancelled |
| scheduledAt, startedAt, endedAt | timestamp | |
| createdAt | timestamp | |

### mentorRatings
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| sessionId | integer | FK → mentorshipSessions |
| studentId, mentorId | integer | FK → users |
| rating | integer | 1–5 stars |
| feedback | text | |
| wouldRecommend | boolean | |
| helpfulness, clarity, patience | integer | 1–5 each |
| createdAt | timestamp | |

### mentorApplications
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| fullName, email, phone, city | text | |
| subjects | text[] | |
| credentials, experience | text | |
| diplomaUrls | text[] | File paths |
| hourlyRate | text | 0 = volunteer |
| gradeLevel | integer | |
| availability | text | |
| status | text | pending, approved, rejected |
| reviewedBy | integer | FK → users |
| reviewedAt | timestamp | |
| adminNotes | text | |
| userId | integer | FK → users (set when approved) |
| createdAt, updatedAt | timestamp | |

### mentorMaterials
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| mentorId | integer | FK → users |
| title, description, subject | text | |
| gradeLevel | text | |
| contentType | text | pdf, image, video, html |
| filePath, fileUrl | text | |
| status | text | pending_review, approved, rejected |
| adminNotes | text | |
| reviewedBy | integer | FK → users |
| reviewedAt | timestamp | |
| teacherRecognized | boolean | Teacher-approved badge |
| createdAt, updatedAt | timestamp | |

### communityPosts (deferred)
**Note:** Community posts/replies tables exist in schema for a future feature. There are no IStorage methods or API routes for them yet; see DEVELOPMENT.md.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| authorId | integer | FK → users |
| title | text | |
| content | text | |
| subject | text | Optional tag |
| postType | text | question, tip, achievement, discussion |
| isHelpful | boolean | Community-marked |
| upvotes | integer | |
| replies | integer | |
| createdAt, updatedAt | timestamp | |

### communityReplies
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| postId | integer | FK → communityPosts |
| authorId | integer | FK → users |
| content | text | |
| isHelpfulAnswer | boolean | |
| upvotes | integer | |
| createdAt | timestamp | |

---

## 8. System Settings

### systemSettings
| Column | Type | Description |
|--------|------|-------------|
| key | text | Primary key (e.g. features, moderation) |
| value | jsonb | Feature flags, blocked words, etc. |
| updatedAt | timestamp | |

---

## 9. Auth Tokens

### authTokens
| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| userId | integer | FK → users |
| token | text | Unique |
| type | text | access, refresh, verification, reset |
| expiresAt | timestamp | |
| isRevoked | boolean | |
| createdAt | timestamp | |

---

## 10. Migrations

```bash
# Push schema to database
npm run db:push
```

Drizzle Kit uses `drizzle.config.ts` and `shared/schema.ts`.

---

## 11. Seed Data

`init-db.sql` seeds default tutor agents:
- math_buddy — Math Buddy
- science_explorer — Dr. Nova
- wordsmith_mentor — Professor Quill

Badge initialization: `scripts/init-badges.ts`
