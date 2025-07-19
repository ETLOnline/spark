"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Users,
  GraduationCap,
  Briefcase,
  Zap,
  Target,
  Award,
  Play,
  Star,
  MessageCircle,
  Rocket,
  TrendingUp,
  CheckCircle,
  Calendar,
  BookOpen,
  Code,
  Brain,
  Network,
  Trophy,
  Sparkles,
  Clock,
  Moon,
  Sun,
  Building,
  Globe,
  Layers,
  Cloud,
  Monitor,
  Server,
  Shield
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import Image from "next/image"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"
import ModeToggle from "@/src/components/ThemeProvider/ThemeToggle"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut"
    }
  }
}

// Define a set of theme-based gradient classes for consistent styling
const themeGradients = [
  "from-primary to-primary", // Primary to slightly darker primary
  "from-primary-hover to-primary", // Darker primary to very dark text
  "from-secondary-primary to-primary", // Muted primary to very dark text
  "from-primary to-secondary-primary" // Primary to dark text
]

// Helper to cycle through gradients
const getGradient = (index: number) =>
  themeGradients[index % themeGradients.length]

const stats = [
  {
    number: "15,000+",
    label: "Active Students",
    icon: Users,
    color: getGradient(0)
  },
  {
    number: "800+",
    label: "Industry Mentors",
    icon: Briefcase,
    color: getGradient(0)
  },
  {
    number: "75+",
    label: "Universities",
    icon: GraduationCap,
    color: getGradient(0)
  },
  {
    number: "2,500+",
    label: "Projects Launched",
    icon: Target,
    color: getGradient(0)
  }
]

// Community Statistics
const communityStats = [
  {
    category: "Students",
    total: "15,247",
    breakdown: [
      { label: "Computer Science", count: "6,890", percentage: 45 },
      { label: "Software Engineering", count: "3,821", percentage: 25 },
      { label: "Data Science", count: "2,134", percentage: 14 },
      { label: "Cybersecurity", count: "1,402", percentage: 9 },
      { label: "Other Tech Fields", count: "1,000", percentage: 7 }
    ],
    icon: GraduationCap,
    color: getGradient(0)
  },
  {
    category: "Mentors",
    total: "847",
    breakdown: [
      { label: "Senior Engineers", count: "312", percentage: 37 },
      { label: "Tech Leads", count: "186", percentage: 22 },
      { label: "Product Managers", count: "127", percentage: 15 },
      { label: "Entrepreneurs", count: "98", percentage: 12 },
      { label: "Researchers", count: "124", percentage: 14 }
    ],
    icon: Briefcase,
    color: getGradient(0)
  },
  {
    category: "Universities",
    total: "78",
    breakdown: [
      { label: "Public Universities", count: "45", percentage: 58 },
      { label: "Private Universities", count: "28", percentage: 36 },
      { label: "International", count: "5", percentage: 6 }
    ],
    icon: Building,
    color: getGradient(0)
  },
  {
    category: "Companies",
    total: "450+",
    breakdown: [
      { label: "Tech Startups", count: "180", percentage: 40 },
      { label: "Multinational Corps", count: "135", percentage: 30 },
      { label: "Local Companies", count: "90", percentage: 20 },
      { label: "Consulting Firms", count: "45", percentage: 10 }
    ],
    icon: Globe,
    color: getGradient(0)
  }
]

// Three-Tier Architecture
const architectureTiers = [
  {
    tier: "Frontend Layer",
    title: "User Experience",
    description:
      "Modern, responsive interfaces built with React, Next.js, and cutting-edge design systems",
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion"
    ],
    features: [
      "Responsive Design",
      "Real-time Updates",
      "Progressive Web App",
      "Accessibility First",
      "Dark/Light Themes"
    ],
    icon: Monitor,
    color: getGradient(0)
  },
  {
    tier: "Backend Layer",
    title: "Business Logic",
    description:
      "Scalable APIs and microservices handling complex business logic and data processing",
    technologies: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"],
    features: [
      "RESTful APIs",
      "GraphQL Endpoints",
      "Real-time WebSockets",
      "Microservices Architecture",
      "Event-Driven Design"
    ],
    icon: Server,
    color: getGradient(0)
  },
  {
    tier: "Infrastructure Layer",
    title: "Cloud & DevOps",
    description:
      "Robust cloud infrastructure ensuring scalability, security, and high availability",
    technologies: ["AWS", "Docker", "Kubernetes", "CI/CD", "Monitoring"],
    features: [
      "Auto-scaling",
      "Load Balancing",
      "Disaster Recovery",
      "Security Monitoring",
      "Performance Analytics"
    ],
    icon: Cloud,
    color: getGradient(0)
  }
]

const communityValues = [
  {
    icon: Network,
    title: "Build Your Professional Network",
    description:
      "Connect with 15,000+ students, 800+ mentors, and faculty from top universities across Pakistan",
    benefit: "Expand your circle",
    color: getGradient(0),
    stats: "15,000+ connections made"
  },
  {
    icon: Brain,
    title: "Learn from Industry Experts",
    description:
      "Get mentored by professionals from Google, Microsoft, Meta, and leading Pakistani tech companies",
    benefit: "Accelerate growth",
    color: getGradient(0),
    stats: "800+ expert mentors"
  },
  {
    icon: Code,
    title: "Work on Real Projects",
    description:
      "Collaborate on industry-sponsored projects and build a portfolio that gets you hired",
    benefit: "Gain experience",
    color: getGradient(0),
    stats: "2,500+ projects completed"
  },
  {
    icon: Trophy,
    title: "Earn Recognition",
    description:
      "Get certified skills, badges, and recommendations that boost your career prospects",
    benefit: "Stand out",
    color: getGradient(0),
    stats: "5,000+ skills validated"
  }
]

const features = [
  {
    icon: MessageCircle,
    title: "Smart Communities",
    description:
      "Join university-specific or topic-based communities with AI-powered content recommendations",
    stats: "50+ Active Communities",
    color: getGradient(0),
    details: [
      "University-specific channels",
      "Topic-based discussions",
      "AI content curation",
      "Expert moderation",
      "Real-time notifications"
    ]
  },
  {
    icon: Calendar,
    title: "Mentorship Sessions",
    description:
      "Book 1-on-1 or group sessions with industry experts. Open sessions and private mentoring available",
    stats: "1000+ Sessions Monthly",
    color: getGradient(0),
    details: [
      "1-on-1 mentoring",
      "Group sessions",
      "Career guidance",
      "Technical reviews",
      "Industry insights"
    ]
  },
  {
    icon: BookOpen,
    title: "Project Spaces",
    description:
      "Collaborative workspaces with task management, file sharing, and real-time collaboration tools",
    stats: "500+ Active Projects",
    color: getGradient(0),
    details: [
      "Team collaboration",
      "Version control",
      "Task management",
      "File sharing",
      "Progress tracking"
    ]
  },
  {
    icon: Brain,
    title: "AI Learning Paths",
    description:
      "Personalized skill development recommendations based on your goals and industry trends",
    stats: "10,000+ Paths Created",
    color: getGradient(0),
    details: [
      "Personalized recommendations",
      "Skill assessments",
      "Learning analytics",
      "Progress tracking",
      "Industry alignment"
    ]
  },
  {
    icon: Award,
    title: "Skill Validation",
    description:
      "Peer endorsements, project reviews, and industry-recognized certifications",
    stats: "5,000+ Skills Validated",
    color: getGradient(0), // Cycle back to first gradient
    details: [
      "Peer endorsements",
      "Project portfolios",
      "Skill certifications",
      "Industry recognition",
      "Career advancement"
    ]
  },
  {
    icon: Briefcase,
    title: "Career Hub",
    description:
      "Job board, internship opportunities, and direct connections with hiring companies",
    stats: "200+ Job Placements",
    color: getGradient(0), // Cycle back to second gradient
    details: [
      "Job opportunities",
      "Internship programs",
      "Company connections",
      "Interview preparation",
      "Career counseling"
    ]
  }
]

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Foundation (Q1 2024)",
    status: "completed",
    items: [
      "Community & Channel Creation",
      "Basic Mentorship Matching",
      "Project Collaboration Spaces",
      "User Profiles & Authentication",
      "File Sharing & Discussions"
    ]
  },
  {
    phase: "Phase 2",
    title: "Enhancement (Q2-Q3 2024)",
    status: "current",
    items: [
      "AI-Powered Recommendations",
      "Advanced Event Management",
      "Skill Validation System",
      "Career Enablement Tools",
      "Mobile App Launch"
    ]
  },
  {
    phase: "Phase 3",
    title: "Scale (Q4 2024 - Q1 2025)",
    status: "upcoming",
    items: [
      "Industry Partner Integration",
      "Advanced Analytics Dashboard",
      "Global University Expansion",
      "Marketplace for Services",
      "Enterprise Solutions"
    ]
  }
]

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Software Engineer at Systems Ltd",
    content:
      "SPARK connected me with my mentor who guided my final year project. The community support was incredible - I got my dream job within 2 months of graduation!",
    avatar: "",
    company: "Systems Ltd",
    achievement: "Landed dream job"
  },
  {
    name: "Dr. Muhammad Ali",
    role: "Head of CS Department, COMSATS",
    content:
      "The platform has transformed how we connect students with industry. Our placement rate increased by 40% since joining SPARK.",
    avatar: "",
    company: "COMSATS University",
    achievement: "40% better placements"
  },
  {
    name: "Fatima Khan",
    role: "Senior Developer at Careem",
    content:
      "Mentoring on SPARK is incredibly rewarding. I've guided 15+ students who are now working at top tech companies. The platform makes mentorship seamless.",
    avatar: "",
    company: "Careem",
    achievement: "15+ successful mentees"
  }
]

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.02,
            y: mousePosition.y * -0.02
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-primary/10 text-foreground hover:bg-primary/20 border-primary/20">
              <Rocket className="w-4 h-4 mr-2" />
              🇵🇰 Empowering Pakistan's Tech Revolution
            </Badge>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-8 text-foreground leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
              Where Tech Dreams
            </span>
            <br />
            <span className="inline-block">
              <Image
                src="/logo/spark-logo-animated-themed.gif"
                width={100}
                height={100}
                alt="Spark logo"
              />
            </span>
          </motion.h1>

          <motion.p
            className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-5xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join Pakistan's largest tech community where
            <span className="text-primary font-bold"> 15,000+ students</span>,
            <span className="text-primary-hover font-bold"> 800+ mentors</span>,
            and
            <span className="text-secondary-foreground font-bold">
              {" "}
              75+ universities
            </span>
            <br />
            collaborate to build the future
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <LinkAsButton
              href="/profile"
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-primary-foreground text-xl px-12 py-6 shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6" />
            </LinkAsButton>
            <Button
              size="lg"
              variant="outline"
              className="text-xl px-12 py-6 border-2 border-border hover:bg-muted dark:hover:bg-muted-hover shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Play className="mr-3 w-6 h-6" />
              Watch Success Stories
            </Button>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  className="text-4xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-40 left-20 hidden lg:block"
          variants={floatingAnimation}
          animate="animate"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full opacity-20" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.02,
            y: mousePosition.y * -0.02
          }}
        />
      </section>

      {/* Community Statistics Section */}
      <section
        id="community"
        className="py-24 px-6 bg-card relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary-foreground border-primary/20">
              <Users className="w-4 h-4 mr-2" />
              Community Insights
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              Our Growing
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Community
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Detailed breakdown of our diverse and thriving tech ecosystem
              across Pakistan
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {communityStats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-xl group bg-card">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {stat.category}
                    </h3>
                    <div className="text-4xl font-bold text-primary mb-6">
                      {stat.total}
                    </div>
                    <div className="space-y-3">
                      {stat.breakdown.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-muted-foreground">
                            {item.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {item.count}
                            </span>
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Universities & Industry Section */}
      <section
        id="enterprise"
        className="py-24 px-6 bg-background relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-secondary/10 dark:bg-secondary/20" />
        <div className="container mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-secondary/10 text-secondary-foreground border-secondary/20">
              <Building className="w-4 h-4 mr-2" />
              Enterprise Solutions
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              For Universities &
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Industry
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Create custom communities with enterprise-grade tools and
              on-demand feature enablement
            </p>
          </motion.div>

          {/* Two-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* Universities */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-xl bg-card">
                <CardContent className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-foreground">
                        Universities
                      </h3>
                      <p className="text-muted-foreground">
                        Academic Excellence Platform
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-4">
                        Create Your Campus Community
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Department-specific spaces with custom branding
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Student-faculty collaboration channels
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Research project management tools
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Industry partnership integration
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted p-6 rounded-xl">
                      <h5 className="font-semibold text-foreground mb-3">
                        Success Metrics
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            40%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Better Placements
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            75+
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Partner Universities
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Industry Experts */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-xl bg-card">
                <CardContent className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${getGradient(1)} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-foreground">
                        Industry Experts
                      </h3>
                      <p className="text-muted-foreground">
                        Professional Networks
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-4">
                        Build Your Expert Community
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Company-branded mentorship spaces
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Talent pipeline development
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Technical interview preparation
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-hover mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Industry project collaboration
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted p-6 rounded-xl">
                      <h5 className="font-semibold text-foreground mb-3">
                        Impact Numbers
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary-foreground">
                            800+
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Expert Mentors
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary-foreground">
                            450+
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Partner Companies
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* On-Demand Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="hover:shadow-2xl transition-all duration-500 border-0 shadow-xl bg-card">
              <CardContent className="p-12">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-foreground mb-4">
                    On-Demand Feature Enablement
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Customize your community with enterprise-grade tools. Enable
                    features as needed for your specific use case.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      icon: MessageCircle,
                      title: "Smart Chat",
                      description:
                        "Real-time messaging with AI moderation, thread management, and file sharing",
                      features: [
                        "Real-time messaging",
                        "AI moderation",
                        "Thread management",
                        "Rich media support"
                      ],
                      color: getGradient(0)
                    },
                    {
                      icon: BookOpen,
                      title: "File Sharing",
                      description:
                        "Secure document management with version control and collaborative editing",
                      features: [
                        "Version control",
                        "Collaborative editing",
                        "Access permissions",
                        "Cloud storage"
                      ],
                      color: getGradient(1)
                    },
                    {
                      icon: Network,
                      title: "Social Posting",
                      description:
                        "LinkedIn-style professional networking with achievements and endorsements",
                      features: [
                        "Professional posts",
                        "Achievement sharing",
                        "Peer endorsements",
                        "Content curation"
                      ],
                      color: getGradient(2)
                    },
                    {
                      icon: Target,
                      title: "Project Management",
                      description:
                        "Jira-integrated project tracking with agile workflows and sprint planning",
                      features: [
                        "Jira integration",
                        "Sprint planning",
                        "Task tracking",
                        "Team analytics"
                      ],
                      color: getGradient(3)
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="bg-muted p-8 rounded-2xl h-full hover:bg-muted-hover transition-all duration-300 group-hover:shadow-lg">
                        <div
                          className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                        >
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground mb-4">
                          {feature.title}
                        </h4>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {feature.description}
                        </p>
                        <ul className="space-y-2">
                          {feature.features.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`}
                              />
                              <span className="text-sm text-muted-foreground">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <div className="bg-muted p-8 rounded-2xl">
                    <h4 className="text-2xl font-bold text-foreground mb-4">
                      Enterprise-Ready Architecture
                    </h4>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-semibold text-foreground mb-2">
                          Enterprise Security
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          SOC 2 compliance, SSO integration, and advanced access
                          controls
                        </p>
                      </div>
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${getGradient(1)} rounded-xl flex items-center justify-center mx-auto mb-3`}
                        >
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-semibold text-foreground mb-2">
                          Scalable Infrastructure
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Auto-scaling, load balancing, and 99.9% uptime
                          guarantee
                        </p>
                      </div>
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${getGradient(2)} rounded-xl flex items-center justify-center mx-auto mb-3`}
                        >
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-semibold text-foreground mb-2">
                          AI-Powered Insights
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          Advanced analytics, predictive modeling, and
                          intelligent recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-primary-foreground text-lg px-10 py-4 shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Building className="mr-3 w-5 h-5" />
                    Create University Community
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 py-4 border-2 border-border hover:bg-muted dark:hover:bg-muted-hover shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Briefcase className="mr-3 w-5 h-5" />
                    Partner with Industry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Three-Tier Architecture Section */}
      <section
        id="architecture"
        className="py-24 px-6 bg-background dark:bg-background"
      >
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-secondary/10 text-secondary-foreground border-secondary/20">
              <Layers className="w-4 h-4 mr-2" />
              Platform Architecture
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              Built for
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Scale
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Modern three-tier architecture ensuring scalability, security, and
              exceptional performance
            </p>
          </motion.div>

          <motion.div
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {architectureTiers.map((tier, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} gap-12`}
              >
                <div className="flex-1">
                  <Card className="hover:shadow-2xl transition-all duration-500 border-0 shadow-xl bg-card">
                    <CardContent className="p-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <tier.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <Badge className="mb-2 bg-muted text-muted-foreground">
                            {tier.tier}
                          </Badge>
                          <h3 className="text-2xl font-bold text-foreground">
                            {tier.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                        {tier.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">
                            Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {tier.technologies.map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                className="bg-primary/10 text-foreground border-primary/20"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">
                            Key Features
                          </h4>
                          <ul className="space-y-2">
                            {tier.features.map((feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-center gap-2 text-muted-foreground"
                              >
                                <CheckCircle className="w-4 h-4 text-primary-hover" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-shrink-0 hidden lg:block">
                  <div
                    className={`w-32 h-32 bg-gradient-to-r ${tier.color} rounded-3xl flex items-center justify-center shadow-2xl`}
                  >
                    <tier.icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Value Section */}
      <section className="py-24 px-6 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-secondary/10 text-secondary-foreground border-secondary/20">
              <Trophy className="w-4 h-4 mr-2" />
              Community Value
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              What You'll
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Gain
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Join a thriving ecosystem where every connection opens new
              possibilities
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {communityValues.map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-xl group bg-card">
                  <CardContent className="p-10 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 dark:bg-secondary/20 rounded-bl-full opacity-50" />
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="mb-4 bg-secondary/10 text-secondary-foreground border-secondary/20">
                      {value.benefit}
                    </Badge>
                    <h3 className="text-2xl font-bold mb-6 text-foreground">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                      {value.description}
                    </p>
                    <div className="text-sm font-medium text-primary">
                      {value.stats}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-6 bg-background dark:bg-background"
      >
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-secondary/10 text-secondary-foreground border-secondary/20">
              <Zap className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              Powerful Tools for
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Success
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Everything you need to learn, grow, and succeed in your tech
              career
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-xl group bg-card">
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 dark:bg-secondary/20 rounded-bl-full opacity-50" />
                    <div
                      className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="mb-4 bg-primary/10 text-foreground border-primary/20 text-xs">
                      {feature.stats}
                    </Badge>
                    <h3 className="text-xl font-bold mb-4 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-primary-hover flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 px-6 bg-card">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-secondary/10 text-secondary-foreground border-secondary/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Our Journey
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              SPARK
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Roadmap
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Building the future of tech education and collaboration in
              Pakistan
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {roadmapPhases.map((phase, index) => (
              <motion.div
                key={index}
                className="relative mb-16 last:mb-0"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} gap-8`}
                >
                  {/* Timeline Node */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl ${
                        phase.status === "completed"
                          ? `bg-gradient-to-r ${getGradient(0)}`
                          : phase.status === "current"
                            ? `bg-gradient-to-r ${getGradient(1)}`
                            : `bg-gradient-to-r ${getGradient(2)}`
                      }`}
                    >
                      {phase.status === "completed" ? (
                        <CheckCircle className="w-10 h-10 text-white" />
                      ) : phase.status === "current" ? (
                        <Zap className="w-10 h-10 text-white" />
                      ) : (
                        <Clock className="w-10 h-10 text-white" />
                      )}
                    </div>
                    {index < roadmapPhases.length - 1 && (
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-border dark:bg-border to-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <Card className="flex-1 hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-card">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <Badge
                          className={`${
                            phase.status === "completed"
                              ? "bg-primary/10 text-foreground"
                              : phase.status === "current"
                                ? "bg-primary/10 text-foreground"
                                : "bg-muted text-muted-foreground"
                          } border-0`}
                        >
                          {phase.phase}
                        </Badge>
                        <Badge
                          className={`${
                            phase.status === "completed"
                              ? "bg-primary text-foreground"
                              : phase.status === "current"
                                ? "bg-primary text-foreground"
                                : "bg-muted-foreground text-white"
                          } border-0`}
                        >
                          {phase.status === "completed"
                            ? "Completed"
                            : phase.status === "current"
                              ? "In Progress"
                              : "Upcoming"}
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-bold mb-6 text-foreground">
                        {phase.title}
                      </h3>
                      <ul className="space-y-3">
                        {phase.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                phase.status === "completed"
                                  ? "bg-primary"
                                  : phase.status === "current"
                                    ? "bg-primary"
                                    : "bg-muted-foreground"
                              }`}
                            />
                            <span className="text-muted-foreground">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section
        id="testimonials"
        className="py-24 px-6 bg-background dark:bg-background"
      >
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-muted text-muted-foreground border-border">
              <Star className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
              Real Impact,
              <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                {" "}
                Real Results
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Hear from the community members whose careers were transformed
              through SPARK
            </p>
          </motion.div>

          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="text-center">
                <div className="flex justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-8 h-8 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-2xl text-foreground mb-10 italic leading-relaxed font-medium">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div className="flex items-center justify-center space-x-6">
                      <img
                        src={
                          testimonials[currentTestimonial].avatar ||
                          "/placeholder.svg"
                        }
                        alt={testimonials[currentTestimonial].name}
                        className="w-16 h-16 rounded-full shadow-lg"
                      />
                      <div className="text-left">
                        <div className="font-bold text-xl text-foreground">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-muted-foreground mb-2">
                          {testimonials[currentTestimonial].role}
                        </div>
                        <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                          {testimonials[currentTestimonial].achievement}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-10 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-gradient-to-r from-primary to-accent scale-125"
                      : "bg-muted-foreground hover:bg-muted-foreground"
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-secondary to-primary-hover relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-primary-foreground">
              Ready to Spark Your Future?
            </h2>
            <p className="text-2xl text-primary-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join 15,000+ students, 800+ mentors, and 75+ universities building
              Pakistan's tech future together
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xl px-12 py-6 shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Join as Student
                <GraduationCap className="ml-3 w-6 h-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground text-foreground hover:bg-primary-foreground hover:text-primary text-xl px-12 py-6 shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Become a Mentor
                <Briefcase className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
