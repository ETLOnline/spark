import { Users, Network, GraduationCap, Medal, Coins } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// SNAPSHOT — mirrors the backend analytics snapshot structure.
// All page-level constants are derived from this single source of truth.
// ─────────────────────────────────────────────────────────────────────────────

export const SNAPSHOT = {
  users: {
    total: 12486,
    active: 9372,
    inactive: 3114,
    verified: 10905,
    completed_profiles: 7618,
    online: 412,
    roles: {
      Student: {
        total: 8214,
        active: 6240,
        inactive: 1974,
        verified: 7105,
        completed_profiles: 4880,
        online: 286
      },
      "No global role": {
        total: 2125,
        active: 1414,
        inactive: 711,
        verified: 1770,
        completed_profiles: 1091,
        online: 22
      },
      "Industry Partner": {
        total: 1108,
        active: 812,
        inactive: 296,
        verified: 1002,
        completed_profiles: 701,
        online: 38
      },
      Mentor: {
        total: 642,
        active: 571,
        inactive: 71,
        verified: 634,
        completed_profiles: 598,
        online: 41
      },
      Faculty: {
        total: 391,
        active: 329,
        inactive: 62,
        verified: 388,
        completed_profiles: 342,
        online: 22
      },
      "Super Admin": {
        total: 6,
        active: 6,
        inactive: 0,
        verified: 6,
        completed_profiles: 6,
        online: 3
      }
    }
  },

  communities: {
    total: 184,
    public: 142,
    private: 42,
    memberships: { total: 14459, active: 11042 },
    channels: {
      total: 512,
      published: 448,
      users: { total: 12486, active: 9372 },
      spaces: {
        total: 1024,
        published: 870,
        users: { total: 12486, active: 9372 },
        posts: { total: 46932, comments: 134201, likes: 89540 },
        files: { total: 3210, types: ["pdf", "image", "video", "doc"] },
        projects: { total: 148, tasks: { total: 1920 } }
      }
    },
    categories: {
      Technology: { communities: 102 },
      Education: { communities: 24 },
      Design: { communities: 18 },
      Business: { communities: 22 },
      Entrepreneurship: { communities: 10 },
      Careers: { communities: 5 },
      Academia: { communities: 3 }
    },
    ranking: {
      by_members: [
        "AI & Machine Learning",
        "Web Development Guild",
        "Data Science Hub",
        "Product Design Circle",
        "Cybersecurity Club"
      ],
      by_posts: [
        "Web Development Guild",
        "AI & Machine Learning",
        "Cybersecurity Club",
        "Data Science Hub",
        "Product Design Circle"
      ]
    },
    community_stats: [
      {
        community_id: "comm-001",
        title: "AI & Machine Learning",
        memberships: { total: 3412, active: 2890 },
        channels: { total: 18, spaces: { total: 36 } },
        posts: { total: 6840, comments: 19520, likes: 15210 }
      },
      {
        community_id: "comm-002",
        title: "Web Development Guild",
        memberships: { total: 2987, active: 2540 },
        channels: { total: 16, spaces: { total: 32 } },
        posts: { total: 7215, comments: 20610, likes: 17340 }
      },
      {
        community_id: "comm-003",
        title: "Data Science Hub",
        memberships: { total: 2540, active: 2140 },
        channels: { total: 14, spaces: { total: 28 } },
        posts: { total: 5102, comments: 14590, likes: 11240 }
      },
      {
        community_id: "comm-004",
        title: "Product Design Circle",
        memberships: { total: 1876, active: 1580 },
        channels: { total: 12, spaces: { total: 24 } },
        posts: { total: 3980, comments: 11360, likes: 9120 }
      },
      {
        community_id: "comm-005",
        title: "Cybersecurity Club",
        memberships: { total: 1644, active: 1390 },
        channels: { total: 10, spaces: { total: 20 } },
        posts: { total: 4410, comments: 12600, likes: 9980 }
      },
      {
        community_id: "comm-006",
        title: "Startup Founders",
        memberships: { total: 1402, active: 1180 },
        channels: { total: 9, spaces: { total: 18 } },
        posts: { total: 2876, comments: 8210, likes: 6540 }
      },
      {
        community_id: "comm-007",
        title: "Cloud & DevOps",
        memberships: { total: 1219, active: 1020 },
        channels: { total: 8, spaces: { total: 16 } },
        posts: { total: 3105, comments: 8870, likes: 7020 }
      },
      {
        community_id: "comm-008",
        title: "Career Launchpad",
        memberships: { total: 1088, active: 910 },
        channels: { total: 7, spaces: { total: 14 } },
        posts: { total: 2214, comments: 6320, likes: 5040 }
      },
      {
        community_id: "comm-009",
        title: "Machine Learning Hub",
        memberships: { total: 980, active: 820 },
        channels: { total: 6, spaces: { total: 12 } },
        posts: { total: 1980, comments: 5650, likes: 4520 }
      },
      {
        community_id: "comm-010",
        title: "UX Designers Guild",
        memberships: { total: 870, active: 730 },
        channels: { total: 6, spaces: { total: 12 } },
        posts: { total: 1740, comments: 4970, likes: 3980 }
      },
      {
        community_id: "comm-011",
        title: "Backend Engineers",
        memberships: { total: 760, active: 640 },
        channels: { total: 5, spaces: { total: 10 } },
        posts: { total: 1520, comments: 4340, likes: 3470 }
      },
      {
        community_id: "comm-012",
        title: "Product Managers",
        memberships: { total: 650, active: 545 },
        channels: { total: 5, spaces: { total: 10 } },
        posts: { total: 1300, comments: 3710, likes: 2970 }
      },
      {
        community_id: "comm-013",
        title: "Frontend Collective",
        memberships: { total: 540, active: 455 },
        channels: { total: 4, spaces: { total: 8 } },
        posts: { total: 1080, comments: 3090, likes: 2470 }
      },
      {
        community_id: "comm-014",
        title: "Data Analytics Circle",
        memberships: { total: 430, active: 360 },
        channels: { total: 4, spaces: { total: 8 } },
        posts: { total: 860, comments: 2460, likes: 1970 }
      },
      {
        community_id: "comm-015",
        title: "Blockchain Society",
        memberships: { total: 320, active: 268 },
        channels: { total: 3, spaces: { total: 6 } },
        posts: { total: 640, comments: 1830, likes: 1460 }
      },
      {
        community_id: "comm-016",
        title: "Game Developers",
        memberships: { total: 210, active: 176 },
        channels: { total: 3, spaces: { total: 6 } },
        posts: { total: 420, comments: 1200, likes: 960 }
      },
      {
        community_id: "comm-017",
        title: "Research Collective",
        memberships: { total: 180, active: 151 },
        channels: { total: 3, spaces: { total: 6 } },
        posts: { total: 360, comments: 1030, likes: 820 }
      },
      {
        community_id: "comm-018",
        title: "Open Source Advocates",
        memberships: { total: 150, active: 126 },
        channels: { total: 2, spaces: { total: 4 } },
        posts: { total: 300, comments: 860, likes: 690 }
      },
      {
        community_id: "comm-019",
        title: "Entrepreneurship Circle",
        memberships: { total: 130, active: 109 },
        channels: { total: 2, spaces: { total: 4 } },
        posts: { total: 260, comments: 740, likes: 590 }
      },
      {
        community_id: "comm-020",
        title: "HR & People Ops",
        memberships: { total: 110, active: 92 },
        channels: { total: 2, spaces: { total: 4 } },
        posts: { total: 220, comments: 630, likes: 500 }
      }
    ]
  },

  mentorship: {
    total: 642,
    active: 318,
    verified: 571,
    availability: { total_slots: 3240, active_slots: 1186 },
    sessions: { total: 6180, pending: 412, completed: 4912, rejected: 856 },
    feedback: { total: 3804, avg_rating: 4.6 },
    ranking: {
      users: [
        {
          info: {
            user_name: "Emily Chen",
            email: "emily.chen@example.com",
            total: 81
          },
          sessions: { total: 88, completed: 81, rejected: 4 },
          feedback: { total: 58 }
        },
        {
          info: {
            user_name: "Mariam Siddiqui",
            email: "mariam.s@example.com",
            total: 117
          },
          sessions: { total: 128, completed: 117, rejected: 6 },
          feedback: { total: 91 }
        },
        {
          info: {
            user_name: "Sofia Martins",
            email: "sofia.martins@example.com",
            total: 96
          },
          sessions: { total: 104, completed: 96, rejected: 5 },
          feedback: { total: 77 }
        },
        {
          info: {
            user_name: "Ayesha Raza",
            email: "ayesha.raza@example.com",
            total: 148
          },
          sessions: { total: 160, completed: 148, rejected: 7 },
          feedback: { total: 112 }
        },
        {
          info: {
            user_name: "Daniel Okafor",
            email: "daniel.okafor@example.com",
            total: 131
          },
          sessions: { total: 142, completed: 131, rejected: 8 },
          feedback: { total: 98 }
        },
        {
          info: {
            user_name: "Usman Farooq",
            email: "usman.farooq@example.com",
            total: 74
          },
          sessions: { total: 80, completed: 74, rejected: 3 },
          feedback: { total: 52 }
        },
        {
          info: {
            user_name: "Bilal Ahmed",
            email: "bilal.ahmed@example.com",
            total: 102
          },
          sessions: { total: 112, completed: 102, rejected: 6 },
          feedback: { total: 80 }
        },
        {
          info: {
            user_name: "Hamza Tariq",
            email: "hamza.tariq@example.com",
            total: 88
          },
          sessions: { total: 96, completed: 88, rejected: 4 },
          feedback: { total: 64 }
        },
        {
          info: {
            user_name: "Zainab Khan",
            email: "zainab.khan@example.com",
            total: 65
          },
          sessions: { total: 71, completed: 65, rejected: 3 },
          feedback: { total: 48 }
        },
        {
          info: {
            user_name: "Raza Ahmed",
            email: "raza.ahmed@example.com",
            total: 59
          },
          sessions: { total: 65, completed: 59, rejected: 3 },
          feedback: { total: 42 }
        },
        {
          info: {
            user_name: "Nadia Farooq",
            email: "nadia.farooq@example.com",
            total: 54
          },
          sessions: { total: 60, completed: 54, rejected: 3 },
          feedback: { total: 38 }
        },
        {
          info: {
            user_name: "Kamran Malik",
            email: "kamran.malik@example.com",
            total: 48
          },
          sessions: { total: 53, completed: 48, rejected: 2 },
          feedback: { total: 34 }
        }
      ]
    }
  },

  posts: {
    total: 46932,
    by_type: [
      { type: "Article", total: 18240 },
      { type: "Discussion", total: 14810 },
      { type: "Resource", total: 8640 },
      { type: "Poll", total: 3120 },
      { type: "Event Post", total: 2122 }
    ],
    by_category: [
      { category: "Technology", total: 22410 },
      { category: "Career", total: 8740 },
      { category: "Education", total: 7310 },
      { category: "Design", total: 4810 },
      { category: "Business", total: 3662 }
    ],
    likes: { total: 89540 },
    comments: { total: 134201 },
    polls: { total: 3120, options: { total: 9840, votes: { total: 42610 } } },
    hashtags: {
      total: 1248,
      top: ["#machinelearning", "#webdev", "#career", "#startup", "#design"]
    },
    ranking: {
      top_posts: [],
      top_creators: []
    }
  },

  rewards: {
    total: 4051880,
    types: {
      rp_points: {
        total: 2847320,
        actions: {
          total: 186420,
          rules: {
            comment_added: { total: 62540 },
            post_created: { total: 48210 },
            daily_login: { total: 47140 },
            resource_shared: { total: 9860 },
            profile_completed: { total: 7618 },
            endorsement_received: { total: 6140 },
            session_completed: { total: 4912 }
          }
        },
        ranking: {
          users: [
            {
              info: {
                user_name: "Ayesha Raza",
                email: "ayesha.raza@example.com",
                total: 9840
              },
              level: { level_id: 5, level_name: "Champion" },
              actions: {
                total: 412,
                type: [
                  { name: "Sessions", count: 148, pct: 36 },
                  { name: "Comments", count: 131, pct: 32 },
                  { name: "Endorsements", count: 74, pct: 18 },
                  { name: "Posts", count: 32, pct: 8 },
                  { name: "Resources", count: 15, pct: 4 },
                  { name: "Logins", count: 12, pct: 3 }
                ]
              }
            },
            {
              info: {
                user_name: "Fatima Malik",
                email: "fatima.malik@example.com",
                total: 9215
              },
              level: { level_id: 5, level_name: "Champion" },
              actions: {
                total: 398,
                type: [
                  { name: "Posts", count: 162, pct: 41 },
                  { name: "Comments", count: 118, pct: 30 },
                  { name: "Resources", count: 61, pct: 15 },
                  { name: "Logins", count: 30, pct: 8 },
                  { name: "Endorsements", count: 18, pct: 5 },
                  { name: "Events", count: 9, pct: 2 }
                ]
              }
            },
            {
              info: {
                user_name: "Daniel Okafor",
                email: "daniel.okafor@example.com",
                total: 8760
              },
              level: { level_id: 4, level_name: "Expert" },
              actions: {
                total: 371,
                type: [
                  { name: "Sessions", count: 131, pct: 35 },
                  { name: "Comments", count: 126, pct: 34 },
                  { name: "Posts", count: 58, pct: 16 },
                  { name: "Resources", count: 14, pct: 4 },
                  { name: "Logins", count: 8, pct: 2 }
                ]
              }
            },
            {
              info: {
                user_name: "Zara Hussain",
                email: "zara.hussain@example.com",
                total: 7930
              },
              level: { level_id: 4, level_name: "Expert" },
              actions: {
                total: 356,
                type: [
                  { name: "Comments", count: 152, pct: 43 },
                  { name: "Posts", count: 121, pct: 34 },
                  { name: "Logins", count: 52, pct: 15 },
                  { name: "Events", count: 5, pct: 1 },
                  { name: "Profile", count: 3, pct: 1 }
                ]
              }
            },
            {
              info: {
                user_name: "Mariam Siddiqui",
                email: "mariam.s@example.com",
                total: 7402
              },
              level: { level_id: 4, level_name: "Expert" },
              actions: {
                total: 322,
                type: [
                  { name: "Sessions", count: 117, pct: 36 },
                  { name: "Resources", count: 96, pct: 30 },
                  { name: "Comments", count: 70, pct: 22 },
                  { name: "Endorsements", count: 25, pct: 8 },
                  { name: "Posts", count: 14, pct: 4 }
                ]
              }
            },
            {
              info: {
                user_name: "Omar Sheikh",
                email: "omar.sheikh@example.com",
                total: 6845
              },
              level: { level_id: 3, level_name: "Achiever" },
              actions: {
                total: 301,
                type: [
                  { name: "Posts", count: 134, pct: 45 },
                  { name: "Comments", count: 110, pct: 37 },
                  { name: "Logins", count: 41, pct: 14 },
                  { name: "Events", count: 10, pct: 3 },
                  { name: "Profile", count: 6, pct: 2 }
                ]
              }
            },
            {
              info: {
                user_name: "Sara Javed",
                email: "sara.javed@example.com",
                total: 6310
              },
              level: { level_id: 3, level_name: "Achiever" },
              actions: {
                total: 276,
                type: [
                  { name: "Resources", count: 102, pct: 37 },
                  { name: "Posts", count: 88, pct: 32 },
                  { name: "Comments", count: 61, pct: 22 },
                  { name: "Events", count: 15, pct: 5 },
                  { name: "Logins", count: 10, pct: 4 }
                ]
              }
            },
            {
              info: {
                user_name: "Laiba Noor",
                email: "laiba.noor@example.com",
                total: 5988
              },
              level: { level_id: 3, level_name: "Achiever" },
              actions: {
                total: 263,
                type: [
                  { name: "Comments", count: 121, pct: 46 },
                  { name: "Posts", count: 84, pct: 32 },
                  { name: "Logins", count: 39, pct: 15 },
                  { name: "Events", count: 12, pct: 5 },
                  { name: "Resources", count: 7, pct: 3 }
                ]
              }
            }
          ]
        }
      },
      sc_points: {
        total: 1204560,
        actions: {
          total: 142380,
          rules: {
            referral_bonus: { total: 38210 },
            event_attended: { total: 31540 },
            resource_uploaded: { total: 28140 },
            mentor_session: { total: 14860 },
            badge_earned: { total: 7630 }
          }
        },
        ranking: {
          users: [
            {
              info: {
                user_name: "Zara Hussain",
                email: "zara.hussain@example.com",
                total: 4820
              },
              level: { level_id: 5, level_name: "Champion" },
              actions: { total: 412, type: [] }
            },
            {
              info: {
                user_name: "Omar Sheikh",
                email: "omar.sheikh@example.com",
                total: 4515
              },
              level: { level_id: 5, level_name: "Champion" },
              actions: { total: 398, type: [] }
            },
            {
              info: {
                user_name: "Laiba Noor",
                email: "laiba.noor@example.com",
                total: 4102
              },
              level: { level_id: 4, level_name: "Expert" },
              actions: { total: 371, type: [] }
            },
            {
              info: {
                user_name: "Ahmed Khan",
                email: "ahmed.khan@example.com",
                total: 3890
              },
              level: { level_id: 4, level_name: "Expert" },
              actions: { total: 356, type: [] }
            },
            {
              info: {
                user_name: "Fatima Malik",
                email: "fatima.malik@example.com",
                total: 3544
              },
              level: { level_id: 4, level_name: "Expert" },
              actions: { total: 322, type: [] }
            }
          ]
        }
      }
    }
  },

  events: {
    total: 248,
    type: { upcoming: 42, completed: 206, registrations: 3180 },
    hosts: {
      total: 84,
      ranking: ["Tech Talks", "Career Fair", "Hackathon 2025"]
    },
    tags: {
      total: 310,
      ranking: ["#ai", "#webdev", "#career", "#startup"]
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Derived constants — computed from SNAPSHOT so they never go out of sync.
// ─────────────────────────────────────────────────────────────────────────────

// ── Overview page ─────────────────────────────────────────────────────────────

export const OVERVIEW_KPIS = [
  {
    label: "Total users",
    value: SNAPSHOT.users.total.toLocaleString(),
    sub: "Registered across all roles",
    icon: Users
  },
  {
    label: "Communities",
    value: SNAPSHOT.communities.total.toLocaleString(),
    sub: "Live on the platform",
    icon: Network
  },
  {
    label: "Active mentors",
    value: SNAPSHOT.mentorship.active.toLocaleString(),
    sub: "Available or engaged on the marketplace",
    icon: GraduationCap
  },
  {
    label: "Total RP issued",
    value: SNAPSHOT.rewards.types.rp_points.total.toLocaleString(),
    sub: "Reputation Points, cumulative",
    icon: Medal
  },
  {
    label: "SC in circulation",
    value: SNAPSHOT.rewards.types.sc_points.total.toLocaleString(),
    sub: "Spark Credits held by users",
    icon: Coins
  }
]

const ALL_ROLE_TOTALS = Object.values(SNAPSHOT.users.roles).reduce(
  (s, r) => s + r.total,
  0
)

export const USER_SEGMENTS = (
  Object.entries(SNAPSHOT.users.roles) as [string, { total: number }][]
).map(([role, data], i) => ({
  role,
  users: data.total,
  share: parseFloat(((data.total / SNAPSHOT.users.total) * 100).toFixed(1)),
  color: [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-slate-400",
    "bg-pink-400"
  ][i]
}))

export const TOP_COMMUNITIES_DATA = SNAPSHOT.communities.community_stats
  .slice(0, 5)
  .map((c) => ({
    name: c.title,
    members: c.memberships.total,
    posts: c.posts.total
  }))

export const TOP_MENTORS_DATA = SNAPSHOT.mentorship.ranking.users
  .sort((a, b) => b.sessions.completed - a.sessions.completed)
  .slice(0, 5)
  .map((u, i) => ({
    initials: u.info.user_name
      .split(" ")
      .map((n) => n[0])
      .join(""),
    name: u.info.user_name,
    value: u.sessions.completed,
    avatarColor: "bg-violet-100 text-violet-700"
  }))

export const MOST_ENGAGED_DATA = SNAPSHOT.rewards.types.sc_points.ranking.users
  .slice(0, 5)
  .map((u) => ({
    initials: u.info.user_name
      .split(" ")
      .map((n) => n[0])
      .join(""),
    name: u.info.user_name,
    value: u.info.total,
    avatarColor: "bg-emerald-100 text-emerald-700"
  }))

// ── Users page ────────────────────────────────────────────────────────────────

export const ROLES = [
  { key: "all", label: "All roles", total: SNAPSHOT.users.total },
  {
    key: "Student",
    label: "Student",
    total: SNAPSHOT.users.roles["Student"].total
  },
  {
    key: "no_role",
    label: "No global role",
    total: SNAPSHOT.users.roles["No global role"].total
  },
  {
    key: "industry",
    label: "Industry Partner",
    total: SNAPSHOT.users.roles["Industry Partner"].total
  },
  {
    key: "Mentor",
    label: "Mentor",
    total: SNAPSHOT.users.roles["Mentor"].total
  },
  {
    key: "Faculty",
    label: "Faculty",
    total: SNAPSHOT.users.roles["Faculty"].total
  },
  {
    key: "super_admin",
    label: "Super Admin",
    total: SNAPSHOT.users.roles["Super Admin"].total
  }
]

const _r = SNAPSHOT.users.roles

export const KPI_BY_ROLE: Record<
  string,
  {
    total: number
    active: number
    inactive: number
    verified: number
    completed: number
    online: number
  }
> = {
  all: {
    total: SNAPSHOT.users.total,
    active: SNAPSHOT.users.active,
    inactive: SNAPSHOT.users.inactive,
    verified: SNAPSHOT.users.verified,
    completed: SNAPSHOT.users.completed_profiles,
    online: SNAPSHOT.users.online
  },
  Student: {
    total: _r["Student"].total,
    active: _r["Student"].active,
    inactive: _r["Student"].inactive,
    verified: _r["Student"].verified,
    completed: _r["Student"].completed_profiles,
    online: _r["Student"].online
  },
  no_role: {
    total: _r["No global role"].total,
    active: _r["No global role"].active,
    inactive: _r["No global role"].inactive,
    verified: _r["No global role"].verified,
    completed: _r["No global role"].completed_profiles,
    online: _r["No global role"].online
  },
  industry: {
    total: _r["Industry Partner"].total,
    active: _r["Industry Partner"].active,
    inactive: _r["Industry Partner"].inactive,
    verified: _r["Industry Partner"].verified,
    completed: _r["Industry Partner"].completed_profiles,
    online: _r["Industry Partner"].online
  },
  Mentor: {
    total: _r["Mentor"].total,
    active: _r["Mentor"].active,
    inactive: _r["Mentor"].inactive,
    verified: _r["Mentor"].verified,
    completed: _r["Mentor"].completed_profiles,
    online: _r["Mentor"].online
  },
  Faculty: {
    total: _r["Faculty"].total,
    active: _r["Faculty"].active,
    inactive: _r["Faculty"].inactive,
    verified: _r["Faculty"].verified,
    completed: _r["Faculty"].completed_profiles,
    online: _r["Faculty"].online
  },
  super_admin: {
    total: _r["Super Admin"].total,
    active: _r["Super Admin"].active,
    inactive: _r["Super Admin"].inactive,
    verified: _r["Super Admin"].verified,
    completed: _r["Super Admin"].completed_profiles,
    online: _r["Super Admin"].online
  }
}

const _pct = (n: number, d: number) => `${((n / d) * 100).toFixed(1)}%`

export const BREAKDOWN_ROWS = [
  ...(Object.entries(_r) as [string, (typeof _r)[keyof typeof _r]][]).map(
    ([role, d]) => ({
      role,
      share: `${((d.total / SNAPSHOT.users.total) * 100).toFixed(1)}% of users`,
      total: d.total,
      active: d.active,
      activePct: _pct(d.active, d.total),
      inactive: d.inactive,
      inactivePct: _pct(d.inactive, d.total),
      verified: d.verified,
      verifiedPct: _pct(d.verified, d.total),
      completed: d.completed_profiles,
      completedPct: _pct(d.completed_profiles, d.total),
      online: d.online,
      onlinePct: _pct(d.online, d.total)
    })
  ),
  {
    role: "All users",
    share: "",
    total: SNAPSHOT.users.total,
    active: SNAPSHOT.users.active,
    activePct: _pct(SNAPSHOT.users.active, SNAPSHOT.users.total),
    inactive: SNAPSHOT.users.inactive,
    inactivePct: _pct(SNAPSHOT.users.inactive, SNAPSHOT.users.total),
    verified: SNAPSHOT.users.verified,
    verifiedPct: _pct(SNAPSHOT.users.verified, SNAPSHOT.users.total),
    completed: SNAPSHOT.users.completed_profiles,
    completedPct: _pct(SNAPSHOT.users.completed_profiles, SNAPSHOT.users.total),
    online: SNAPSHOT.users.online,
    onlinePct: _pct(SNAPSHOT.users.online, SNAPSHOT.users.total)
  }
]

// ── Communities page ───────────────────────────────────────────────────────────

export const COMMUNITIES_KPIS = {
  total: SNAPSHOT.communities.total,
  posts: SNAPSHOT.communities.channels.spaces.posts.total
}

export const ALL_COMMUNITIES = SNAPSHOT.communities.community_stats.map(
  (c, i) => ({
    initials: c.title
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase(),
    name: c.title,
    category:
      Object.entries(SNAPSHOT.communities.categories).find(
        ([, v]) => v.communities >= 0
      )?.[0] ?? "Technology", // simplified — real data would carry category per community
    members: c.memberships.total,
    posts: c.posts.total
  })
)

// Attach proper categories
const COMMUNITY_CATEGORIES: Record<string, string> = {
  "comm-001": "Technology",
  "comm-002": "Technology",
  "comm-003": "Technology",
  "comm-004": "Design",
  "comm-005": "Technology",
  "comm-006": "Entrepreneurship",
  "comm-007": "Technology",
  "comm-008": "Careers",
  "comm-009": "Technology",
  "comm-010": "Design",
  "comm-011": "Technology",
  "comm-012": "Business",
  "comm-013": "Technology",
  "comm-014": "Technology",
  "comm-015": "Technology",
  "comm-016": "Technology",
  "comm-017": "Academia",
  "comm-018": "Technology",
  "comm-019": "Business",
  "comm-020": "Business"
}

// Re-export with categories attached properly
export const COMMUNITIES_TABLE = SNAPSHOT.communities.community_stats.map(
  (c, i) => ({
    initials: c.title
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase(),
    name: c.title,
    category: COMMUNITY_CATEGORIES[c.community_id] ?? "Technology",
    members: c.memberships.total,
    posts: c.posts.total
  })
)

// ── Mentorship page ───────────────────────────────────────────────────────────

export const MENTORSHIP_KPIS = {
  total: SNAPSHOT.mentorship.total,
  active: SNAPSHOT.mentorship.active,
  verified: SNAPSHOT.mentorship.verified,
  sessions_completed: SNAPSHOT.mentorship.sessions.completed
}

export const SESSION_STATS = [
  {
    label: "Completed",
    count: SNAPSHOT.mentorship.sessions.completed,
    total: SNAPSHOT.mentorship.sessions.total,
    pct: parseFloat(
      (
        (SNAPSHOT.mentorship.sessions.completed /
          SNAPSHOT.mentorship.sessions.total) *
        100
      ).toFixed(1)
    ),
    color: "bg-emerald-500"
  },
  {
    label: "Rejected",
    count: SNAPSHOT.mentorship.sessions.rejected,
    total: SNAPSHOT.mentorship.sessions.total,
    pct: parseFloat(
      (
        (SNAPSHOT.mentorship.sessions.rejected /
          SNAPSHOT.mentorship.sessions.total) *
        100
      ).toFixed(1)
    ),
    color: "bg-red-400"
  },
  {
    label: "Pending",
    count: SNAPSHOT.mentorship.sessions.pending,
    total: SNAPSHOT.mentorship.sessions.total,
    pct: parseFloat(
      (
        (SNAPSHOT.mentorship.sessions.pending /
          SNAPSHOT.mentorship.sessions.total) *
        100
      ).toFixed(1)
    ),
    color: "bg-amber-400"
  }
]

export const MENTORSHIP_AVAILABILITY = {
  active_slots: SNAPSHOT.mentorship.availability.active_slots,
  total_slots: SNAPSHOT.mentorship.availability.total_slots,
  active_pct: parseFloat(
    (
      (SNAPSHOT.mentorship.availability.active_slots /
        SNAPSHOT.mentorship.availability.total_slots) *
      100
    ).toFixed(1)
  )
}

export const MENTORSHIP_FEEDBACK = {
  avg_rating: SNAPSHOT.mentorship.feedback.avg_rating,
  total: SNAPSHOT.mentorship.feedback.total,
  pct_of_completed: parseFloat(
    (
      (SNAPSHOT.mentorship.feedback.total /
        SNAPSHOT.mentorship.sessions.completed) *
      100
    ).toFixed(1)
  )
}

const MENTOR_AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-lime-100 text-lime-700",
  "bg-sky-100 text-sky-700"
]

// Ratings are not in the backend structure yet, so kept as supplementary data
const MENTOR_RATINGS: Record<string, { rating: number; reviews: number }> = {
  "Emily Chen": { rating: 4.97, reviews: 58 },
  "Mariam Siddiqui": { rating: 4.94, reviews: 91 },
  "Sofia Martins": { rating: 4.89, reviews: 77 },
  "Ayesha Raza": { rating: 4.86, reviews: 112 },
  "Daniel Okafor": { rating: 4.72, reviews: 98 },
  "Usman Farooq": { rating: 4.68, reviews: 52 },
  "Bilal Ahmed": { rating: 4.61, reviews: 80 },
  "Hamza Tariq": { rating: 4.55, reviews: 64 },
  "Zainab Khan": { rating: 4.5, reviews: 48 },
  "Raza Ahmed": { rating: 4.45, reviews: 42 },
  "Nadia Farooq": { rating: 4.4, reviews: 38 },
  "Kamran Malik": { rating: 4.35, reviews: 34 }
}

export const ALL_MENTORS = SNAPSHOT.mentorship.ranking.users.map((u, i) => {
  const name = u.info.user_name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
  const extra = MENTOR_RATINGS[name] ?? { rating: 4.0, reviews: 0 }
  return {
    initials,
    name,
    sessions: u.sessions.completed,
    rating: extra.rating,
    reviews: extra.reviews,
    avatarBg: MENTOR_AVATAR_COLORS[i % MENTOR_AVATAR_COLORS.length]
  }
})

// ── Leaderboards page ─────────────────────────────────────────────────────────

export const LEADERBOARDS_KPIS = {
  total_rewards: SNAPSHOT.rewards.total,
  rp_total: SNAPSHOT.rewards.types.rp_points.total,
  rp_actions: SNAPSHOT.rewards.types.rp_points.actions.total,
  sc_total: SNAPSHOT.rewards.types.sc_points.total,
  sc_actions: SNAPSHOT.rewards.types.sc_points.actions.total,
  total_actions:
    SNAPSHOT.rewards.types.rp_points.actions.total +
    SNAPSHOT.rewards.types.sc_points.actions.total
}

const _rpRules = SNAPSHOT.rewards.types.rp_points.actions.rules
const _rpTotal = SNAPSHOT.rewards.types.rp_points.actions.total

export const RP_ACTIONS = [
  {
    key: "comment_added",
    label: "Comment added",
    count: _rpRules.comment_added.total,
    pct: parseFloat(
      ((_rpRules.comment_added.total / _rpTotal) * 100).toFixed(1)
    )
  },
  {
    key: "post_created",
    label: "Post created",
    count: _rpRules.post_created.total,
    pct: parseFloat(((_rpRules.post_created.total / _rpTotal) * 100).toFixed(1))
  },
  {
    key: "daily_login",
    label: "Daily login",
    count: _rpRules.daily_login.total,
    pct: parseFloat(((_rpRules.daily_login.total / _rpTotal) * 100).toFixed(1))
  },
  {
    key: "resource_shared",
    label: "Resource shared",
    count: _rpRules.resource_shared.total,
    pct: parseFloat(
      ((_rpRules.resource_shared.total / _rpTotal) * 100).toFixed(1)
    )
  },
  {
    key: "profile_completed",
    label: "Profile completed",
    count: _rpRules.profile_completed.total,
    pct: parseFloat(
      ((_rpRules.profile_completed.total / _rpTotal) * 100).toFixed(1)
    )
  },
  {
    key: "endorsement_received",
    label: "Endorsement received",
    count: _rpRules.endorsement_received.total,
    pct: parseFloat(
      ((_rpRules.endorsement_received.total / _rpTotal) * 100).toFixed(1)
    )
  },
  {
    key: "session_completed",
    label: "Session completed",
    count: _rpRules.session_completed.total,
    pct: parseFloat(
      ((_rpRules.session_completed.total / _rpTotal) * 100).toFixed(1)
    )
  }
]

const _scRules = SNAPSHOT.rewards.types.sc_points.actions.rules
const _scTotal = SNAPSHOT.rewards.types.sc_points.actions.total

export const SC_ACTIONS = [
  {
    key: "referral_bonus",
    label: "Referral bonus",
    count: _scRules.referral_bonus.total,
    pct: parseFloat(
      ((_scRules.referral_bonus.total / _scTotal) * 100).toFixed(1)
    )
  },
  {
    key: "event_attended",
    label: "Event attended",
    count: _scRules.event_attended.total,
    pct: parseFloat(
      ((_scRules.event_attended.total / _scTotal) * 100).toFixed(1)
    )
  },
  {
    key: "resource_uploaded",
    label: "Resource uploaded",
    count: _scRules.resource_uploaded.total,
    pct: parseFloat(
      ((_scRules.resource_uploaded.total / _scTotal) * 100).toFixed(1)
    )
  },
  {
    key: "mentor_session",
    label: "Mentor session",
    count: _scRules.mentor_session.total,
    pct: parseFloat(
      ((_scRules.mentor_session.total / _scTotal) * 100).toFixed(1)
    )
  },
  {
    key: "badge_earned",
    label: "Badge earned",
    count: _scRules.badge_earned.total,
    pct: parseFloat(((_scRules.badge_earned.total / _scTotal) * 100).toFixed(1))
  }
]

export const RP_SUMMARY = [
  {
    label: "Points issued",
    value: SNAPSHOT.rewards.types.rp_points.total.toLocaleString()
  },
  {
    label: "Rewarded actions",
    value: SNAPSHOT.rewards.types.rp_points.actions.total.toLocaleString()
  },
  {
    label: "Avg points / action",
    value: (
      SNAPSHOT.rewards.types.rp_points.total /
      SNAPSHOT.rewards.types.rp_points.actions.total
    ).toFixed(1)
  },
  {
    label: "Share of all rewards",
    value: `${((SNAPSHOT.rewards.types.rp_points.total / SNAPSHOT.rewards.total) * 100).toFixed(1)}%`
  }
]

export const SC_SUMMARY = [
  {
    label: "Credits issued",
    value: SNAPSHOT.rewards.types.sc_points.total.toLocaleString()
  },
  {
    label: "Rewarded actions",
    value: SNAPSHOT.rewards.types.sc_points.actions.total.toLocaleString()
  },
  {
    label: "Avg credits / action",
    value: (
      SNAPSHOT.rewards.types.sc_points.total /
      SNAPSHOT.rewards.types.sc_points.actions.total
    ).toFixed(1)
  },
  {
    label: "Share of all rewards",
    value: `${((SNAPSHOT.rewards.types.sc_points.total / SNAPSHOT.rewards.total) * 100).toFixed(1)}%`
  }
]

export const ACTION_COLORS: Record<string, string> = {
  Sessions: "bg-violet-500",
  Comments: "bg-emerald-500",
  Endorsements: "bg-pink-500",
  Posts: "bg-blue-500",
  Resources: "bg-amber-500",
  Logins: "bg-slate-400",
  Events: "bg-cyan-500",
  Profile: "bg-green-500"
}

const EARNER_AVATAR_COLORS: Record<string, string> = {
  "Ayesha Raza": "bg-violet-100 text-violet-700",
  "Fatima Malik": "bg-pink-100 text-pink-700",
  "Daniel Okafor": "bg-amber-100 text-amber-700",
  "Zara Hussain": "bg-emerald-100 text-emerald-700",
  "Mariam Siddiqui": "bg-blue-100 text-blue-700",
  "Omar Sheikh": "bg-cyan-100 text-cyan-700",
  "Sara Javed": "bg-orange-100 text-orange-700",
  "Laiba Noor": "bg-rose-100 text-rose-700"
}

export const ALL_EARNERS = SNAPSHOT.rewards.types.rp_points.ranking.users.map(
  (u, i) => ({
    rank: i + 1,
    initials: u.info.user_name
      .split(" ")
      .map((n) => n[0])
      .join(""),
    name: u.info.user_name,
    email: u.info.email,
    level: `L${u.level.level_id}·${u.level.level_name}`,
    rp: u.info.total,
    actions: u.actions.total,
    avatarBg:
      EARNER_AVATAR_COLORS[u.info.user_name] ?? "bg-slate-100 text-slate-700",
    breakdown: u.actions.type.map((t) => ({
      type: t.name,
      count: t.count,
      pct: t.pct
    }))
  })
)

/** Badge colours for the top three positions in analytics rankings (rank 4+ is a plain number). */
export const RANK_BADGE_CLASSES: Record<number, string> = {
  1: "bg-amber-100 text-amber-700 border-amber-300 font-bold",
  2: "bg-gray-100 text-gray-500 border-gray-300 font-semibold",
  3: "bg-orange-100 text-orange-600 border-orange-300 font-semibold"
}
