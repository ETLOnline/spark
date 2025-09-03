import type { Metadata } from "next"
import Link from "next/link"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Use - Spark Platform",
  description:
    "Terms of Use for Spark Platform - Made-in-Pakistan open-source platform for Final Year Projects"
}

export default function TermsPage() {
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
              <span className="text-primary">📋</span>
              <span className="text-sm font-medium text-muted-foreground">
                Legal Documentation
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-600 bg-clip-text text-transparent">
              Terms of Use
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
              Welcome to &nbsp;
              <Link
                href="https://spark.etlonline.org/"
                className="text-primary hover:text-primary/80 font-medium underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
              >
                Spark
              </Link>
              , a Made-in-Pakistan open-source platform developed by
              ETLOnline.org. By using Spark, you agree to the following terms.
              Please read them carefully.
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  1
                </span>
                Purpose of Spark
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Spark is built to support Final Year Projects (FYPs) by enabling
                collaboration among students, faculty, and industry mentors. The
                platform is for educational and professional development use
                only.
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  2
                </span>
                Account Responsibilities
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You are responsible for keeping your login details secure.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You agree to provide accurate information when creating or
                  updating your profile.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You are responsible for all activity under your account.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  3
                </span>
                Acceptable Use
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Post false, offensive, or harmful content.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Misuse the platform for spam, commercial advertising, or
                  non-academic purposes.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Copy, modify, or distribute platform content without
                  permission.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Violate any applicable laws while using Spark.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  4
                </span>
                Intellectual Property
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Content you create (e.g., project ideas, documents,
                  discussions) remains yours.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  By sharing content on Spark, you grant ETL permission to use
                  it for educational purposes, research, and platform
                  improvement.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  ETL retains rights to the Spark platform, design, and
                  technology.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  5
                </span>
                Mentorship & Advisory
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Industry mentors and faculty advisors provide guidance
                  voluntarily.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  ETL is not liable for any outcomes, decisions, or disputes
                  arising from mentorship interactions.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  6
                </span>
                Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of Spark is also governed by our{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80 font-medium underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  7
                </span>
                Limitation of Liability
              </h2>
              <ul className="space-y-3 text-muted-foreground leading-relaxed">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Spark is provided "as is." We make no guarantees about
                  uninterrupted access, accuracy, or results.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  ETL is not responsible for loss of data, project delays, or
                  damages arising from platform use.
                </li>
              </ul>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  8
                </span>
                Termination of Use
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                ETL may suspend or terminate accounts that violate these terms
                or misuse the platform.
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  9
                </span>
                Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms of Use at any time. Updates will be
                posted here with a new "Effective Date."
              </p>
            </section>

            <section className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                  10
                </span>
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms, please contact:
              </p>
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-foreground font-medium flex items-center">
                  <span className="text-primary mr-2">
                    <Mail />{" "}
                  </span>
                  <a
                    href="mailto:info@etlonline.org"
                    className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors"
                  >
                    info@etlonline.org
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
