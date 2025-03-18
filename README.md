
## 3. Competitive Analysis

```mermaid
quadrantChart
    title "Online Exam Platform Comparison"
    x-axis "Low Feature Set" --> "High Feature Set"
    y-axis "Low User Experience" --> "High User Experience"
    quadrant-1 "Leaders"
    quadrant-2 "Feature Rich"
    quadrant-3 "Basic Solutions"
    quadrant-4 "User Friendly"
    "Testbook": [0.8, 0.7]
    "Gradeup": [0.7, 0.65]
    "Examly": [0.6, 0.55]
    "Traditional LMS": [0.4, 0.3]
    "AspireExamine": [0., 0.85]
```

### 3.1 Competitive Analysis Table

| Feature | AspireExamine | Testbook | Gradeup | Examly |
|---------|--------------|----------|---------|--------|
| No Registration Required | ✅ | ❌ | ❌ | ❌ |
| Real-time Updates | ✅ | ✅ | ❌ | ✅ |
| PDF Reports | ✅ | ✅ | ✅ | ✅ |
| Image Support | ✅ | ✅ | ✅ | ✅ |
| Offline Access | ✅ | ❌ | ❌ | ❌ |
| Session Backup | ✅ | ✅ | ❌ | ❌ |

### 3.2 Competitive Advantages
1. No-registration approach reduces friction
2. Modern tech stack ensures better performance
3. Real-time capabilities enhance user experience
4. Automated PDF generation saves time
5. Session persistence provides reliability



sequenceDiagram
    participant Client
    participant NextServer
    participant Supabase
    participant Storage
    participant Worker

    %% Admin Authentication Flow
    Client->>NextServer: POST /api/admin/login
    NextServer->>Supabase: verifyPassword(hash)
    Supabase-->>NextServer: Success/Failure
    NextServer-->>Client: Session Token

    %% Exam Creation Flow
    Client->>NextServer: POST /api/exams
    NextServer->>Supabase: INSERT exam
    Supabase-->>NextServer: Exam Data
    NextServer-->>Client: Created Exam

    %% Question Upload with Image
    Client->>Storage: Upload Image
    Storage-->>Client: Image URL
    Client->>NextServer: POST /api/questions/bulk
    NextServer->>Supabase: INSERT questions
    Supabase-->>NextServer: Question Data
    NextServer-->>Client: Created Questions

    %% Quiz Session Flow
    Client->>NextServer: GET /api/public/exam/:id/start
    NextServer->>Supabase: SELECT exam + questions
    Supabase-->>NextServer: Quiz Data
    NextServer-->>Client: Quiz Initialized
    Client->>Supabase: Subscribe to updates

    %% Answer Submission
    Client->>NextServer: POST /api/public/session/:id/answer
    NextServer->>Supabase: UPDATE session
    Supabase-->>Client: Real-time update
    NextServer-->>Client: Success Response

    %% PDF Generation
    Client->>NextServer: GET /api/public/session/:id/pdf
    NextServer->>Worker: Generate PDF
    Worker->>Supabase: Fetch session data
    Supabase-->>Worker: Complete data
    Worker-->>NextServer: PDF blob
    NextServer-->>Client: PDF download
