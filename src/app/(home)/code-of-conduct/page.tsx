import Link from "next/link"
import { Mail } from "lucide-react"
import { CocAcknowledgementForm } from "./CocAcknowledgementForm"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export default async function CodeOfConductPage() {
  let userId: string | null = null
  try {
    const user = await AuthUserAction()
    if (user && !user.profile?.coc_acknowledged) {
      userId = user.unique_id
    }
  } catch {
    // unauthenticated visitor — no form shown
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-card/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <span className="text-primary">📋</span>
              <span className="text-sm font-medium text-muted-foreground">
                Community Standards
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-600 bg-clip-text text-transparent">
              Code of Conduct
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">Spark Platform</p>
            </div>
          </div>

          {/* 1. Purpose */}
          <div className="bg-card/70 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                1
              </span>
              Purpose
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              This Code of Conduct sets the standard of behavior expected from
              everyone using SPARK — ETL Online&apos;s collaboration,
              communication, and project management platform. It applies
              wherever SPARK is used: within Communities, Channels, project
              Spaces, mentorship sessions, and any associated communication.
            </p>
          </div>

          <div className="space-y-8">
            {/* 2. Core Principles */}
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  2
                </span>
                Core Principles
              </h2>
              <ul className="space-y-3 text-foreground/80 leading-relaxed">
                <li>
                  <strong className="text-foreground">Respect</strong> — Treat
                  every member, regardless of role, university, or experience
                  level, with courtesy and professionalism.
                </li>
                <li>
                  <strong className="text-foreground">Integrity</strong> —
                  Represent your work, credentials, and contributions honestly.
                </li>
                <li>
                  <strong className="text-foreground">Accountability</strong> —
                  Take ownership of your commitments, meetings, milestones,
                  mentorship sessions, and feedback.
                </li>
                <li>
                  <strong className="text-foreground">Collaboration</strong> —
                  Engage constructively; SPARK exists to connect people who are
                  here to learn and grow.
                </li>
              </ul>
            </section>

            {/* 3. Expected Behavior */}
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  3
                </span>
                Expected Behavior
              </h2>
              <ul className="space-y-2 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                <li>Communicate professionally.</li>
                <li>
                  Give and receive feedback constructively; critique the work,
                  not the person.
                </li>
                <li>
                  Respect confidentiality: don&apos;t share another user&apos;s
                  project details, personal information, or private discussions
                  outside the platform without consent.
                </li>
                <li>
                  Use real, accurate information in profiles, project
                  submissions, and credentials.
                </li>
                <li>
                  Respond to requests (advisor requests, mentorship requests,
                  meeting scheduling) within a reasonable time, and formally
                  decline rather than ignore.
                </li>
              </ul>
            </section>

            {/* 4. Role-Specific Responsibilities */}
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  4
                </span>
                Role-Specific Responsibilities
              </h2>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Students</h3>
                <ul className="space-y-1 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                  <li>
                    Submit original project work; disclose any external tools,
                    code, or datasets used.
                  </li>
                  <li>
                    Attend scheduled meetings/sessions or notify in advance if
                    unable to.
                  </li>
                  <li>
                    Provide honest closure feedback about the advisor/mentor
                    relationship.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Advisors / Mentors
                </h3>
                <ul className="space-y-1 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                  <li>
                    Accept only requests within your genuine domain expertise.
                  </li>
                  <li>
                    Provide constructive guidance; if rejecting a request, give
                    a clear and respectful reason.
                  </li>
                  <li>
                    Avoid favoritism; evaluate all students/mentees on merit.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Faculty</h3>
                <ul className="space-y-1 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                  <li>
                    Monitor assigned projects&apos; progress in good faith.
                  </li>
                  <li>
                    Support the advisor-student relationship without overriding
                    the advisor&apos;s guidance.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  University Admins
                </h3>
                <ul className="space-y-1 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                  <li>
                    Enable the &quot;Request Advisor&quot; feature responsibly,
                    and manage channel-level settings fairly across all
                    students.
                  </li>
                  <li>
                    Respect the boundary of your own university&apos;s data — do
                    not attempt to access other universities&apos; submissions.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  ETL Admins
                </h3>
                <ul className="space-y-1 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                  <li>
                    Use platform-wide monitoring access solely for oversight and
                    program health — not to intervene in individual requests or
                    assignments outside defined processes.
                  </li>
                  <li>
                    Protect the privacy of feedback, rejection reasons, and
                    personal data stored on the platform.
                  </li>
                </ul>
              </div>
            </section>

            {/* 5. Prohibited Conduct */}
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  5
                </span>
                Prohibited Conduct
              </h2>
              <ul className="space-y-2 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                <li>
                  Harassment, discrimination, or abusive language of any kind
                  (based on gender, religion, ethnicity, background, university,
                  or otherwise).
                </li>
                <li>
                  Plagiarism or misrepresentation of project work, credentials,
                  or identity.
                </li>
                <li>
                  Spamming, unsolicited promotion, or off-topic content in
                  Communities/Channels/Spaces.
                </li>
                <li>
                  Sharing another user&apos;s private information, files, or
                  feedback without consent.
                </li>
                <li>
                  Attempting to manipulate the RP/SC economy or leaderboards
                  (e.g., fake engagement, self-endorsement abuse).
                </li>
                <li>
                  Circumventing platform processes (e.g., contacting advisors
                  outside the Request Advisor flow to bypass the domain-routing
                  system).
                </li>
                <li>
                  Uploading malicious files, offensive content, or anything
                  violating intellectual property rights.
                </li>
              </ul>
            </section>

            {/* 6. Reporting & Enforcement */}
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  6
                </span>
                Reporting &amp; Enforcement
              </h2>
              <ul className="space-y-2 text-foreground/80 leading-relaxed list-disc list-inside pl-2">
                <li>
                  Violations can be reported directly to the ETL Admin team.
                </li>
                <li>
                  Repeated or severe violations (harassment, plagiarism, data
                  misuse) may result in removal from the SPARK platform and,
                  where applicable, referral to the user&apos;s university.
                </li>
              </ul>
            </section>

            {/* 7. Acknowledgment */}
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  7
                </span>
                Acknowledgment
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                By using SPARK, all users — students, mentors, advisors,
                faculty, and admins — agree to uphold this Code of Conduct in
                every Community, Channel, and Space they participate in.
              </p>
            </section>
          </div>

          {/* Acknowledgement form — shown only if logged-in user hasn't acknowledged yet */}
          {userId && <CocAcknowledgementForm userId={userId} />}
        </div>
      </div>
    </div>
  )
}
