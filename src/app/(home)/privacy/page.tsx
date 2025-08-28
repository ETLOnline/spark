import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy - Spark Platform",
  description:
    "Privacy Policy for Spark Platform - Made-in-Pakistan open-source platform for Final Year Projects"
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative">
        <div className="space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-card/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <span className="text-primary">🔒</span>
              <span className="text-sm font-medium text-muted-foreground">
                Legal Documentation
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground">Spark Platform</p>
              <p className="text-sm text-muted-foreground/70">
                Effective Date: 14-Aug-2025
              </p>
            </div>
          </div>

          <div className="bg-card/70 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-lg">
            <p className="text-foreground/80 leading-relaxed text-lg">
              At ETL, we respect your privacy. This Privacy Policy explains how
              &nbsp;
              <Link
                href="https://spark.etlonline.org/"
                className="text-primary hover:text-primary/80 font-medium underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
              >
                Spark
              </Link>
              &nbsp; collects, uses, and protects your information. By using
              Spark, you agree to this policy.
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  1
                </span>
                Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use Spark, we may collect:
              </p>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Personal details you provide (name, email, profile
                  information).
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Project data you submit (FYP ideas, documents, discussions).
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Usage data (logins, activity, device/browser information).
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  2
                </span>
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Facilitate collaboration between students, faculty, and
                  mentors.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Manage Final Year Projects (FYPs) and related activities.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Improve the platform and provide better features.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Communicate important updates, events, or opportunities.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  3
                </span>
                How We Share Information
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  We do not sell your information.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Your profile and project details may be shared with faculty,
                  mentors, and students for academic collaboration.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  We may share limited data if required by law or to protect
                  platform security.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  4
                </span>
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable measures to protect your information.
                However, no system is 100% secure, so please use Spark
                responsibly.
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  5
                </span>
                Your Choices
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You can update or remove your profile information at any time.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You may request deletion of your account by contacting ETL.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You may opt out of non-essential emails or notifications.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  6
                </span>
                Cookies and Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Spark may use cookies to improve user experience (e.g., keeping
                you logged in, remembering settings). You can disable cookies in
                your browser, but some features may not work properly.
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  7
                </span>
                Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Spark is designed for university-level students and above. We do
                not knowingly collect information from children under 13.
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  8
                </span>
                Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this policy from time to time. Updates will be
                posted here with a new "Effective Date."
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  9
                </span>
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions, please contact:
              </p>
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-foreground font-medium flex items-center">
                  <span className="text-primary mr-2">📧</span>
                  <a
                    href="mailto:spark-noreply@etlonline.org"
                    className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
                  >
                    spark-noreply@etlonline.org
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
