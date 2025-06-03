# Spark 🌟

[![Open Source](https://img.shields.io/badge/Open%20Source-Contributions%20Welcome-brightgreen)](https://github.com/ETLOnline/spark)
[![License](https://img.shields.io/github/license/ETLOnline/spark)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-blue)](https://nextjs.org/)

Spark is an open-source platform designed to connect students, community members, and industry professionals to collaborate on innovative solutions, gain valuable learning experiences, and contribute to open-source projects. By fostering a culture of shared knowledge and contribution, Spark aims to bridge gaps in education, industry requirements, and technological advancement in Pakistan and beyond.

---

## 🚀 Vision

To empower learners and professionals to engage in impactful collaborations, create practical solutions, and foster a thriving open-source ecosystem.

---

## ✨ Key Features

- **Profile & Engagement**

  - Comprehensive profiles with skill tags, experience, and achievements.
  - Recognition through badges, rewards, and endorsements.

- **Internships, Freelance, & Bounty Programs**

  - Listings for freelance opportunities, bounties, and internships with tracking and rewards.

- **Job Portal**

  - Skill-based job listings with industry collaboration.

- **Resources & Courses**

  - Access to free, point-based, or paid learning materials.

- **Session & Event Planning**

  - Seamless event scheduling, notifications, and rewards for participation.

- **Project Idea Bank**

  - A repository of problem statements and solutions for students, professionals, and communities.

- **Channels & Spaces**

  - Collaborate in dedicated spaces with real-time chat, file sharing, feeds and posts, and project management tools.

- **Rewards System**

  - Points and badges for engagement, contributions, and accomplishments.

- **Automation**

  - Notifications and reward management for improved user experience.

---

## 🔧 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- 🔒 User authentication with [Clerk](https://clerk.dev/)
- 🧠 Database using [Turso](https://turso.tech/) (SQLite) and [Drizzle ORM](https://orm.drizzle.team/)
- 💅 Modern styling with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- 🪳 Object storage using S3-compatible services (e.g., MinIO)
- 🔄 Real-time interactions using [Ably](https://ably.com/)
- 🚀 Developer-friendly with seeding, migration, and structured environment management

---

## 🤝 How to Contribute

We welcome contributors from all skill levels! Here's how you can get started:

### 1. Star the Repository

Show your support by starring this repository!

### 2. Fork the Repository

Click the "Fork" button to create your own copy.

### 3. Clone the Repository

```bash
git clone https://github.com/ETLOnline/spark.git
cd spark
```

### 4. Install Dependencies

```bash
npm install --force
```

### 5. Set up Environment Variables

1. Copy the `.env.example` file to `.env`
2. Replace placeholder values with your own credentials

#### Example `.env` Structure (No Secrets Included):

```env
TURSO_DATABASE_URL=use-your-own-db
TURSO_AUTH_TOKEN=use-your-own-token

WEBHOOK_SECRET=your-webhook-secret

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

ABLY_API_KEY=your-ably-api-key

S3_BUCKET_NAME=your-bucket
S3_REGION=your-region
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_ENDPOINT=your-s3-endpoint
```

### 6. Configure Database (Turso)

1. Visit [https://turso.tech](https://turso.tech) and log in
2. Create a new database using the **web dashboard**
3. Use the generated credentials in your `.env` file

### 7. Run Migrations and Seed

```bash
npm run db:migrate
npm run db:seed
```

### 8. Run the App Locally

```bash
npm run dev
```

> **Note:** Creating a new user will not work on localhost since webhooks are configured for the deployed URL.

### 9. Pick an Issue

Check the [Issues](https://github.com/ETLOnline/spark/issues) tab for tasks labeled as `good first issue` or `help wanted`.

### 10. Create a Branch

Use the format:

```bash
git checkout -b feature/issue-number-short-description
```

Example:

```bash
git checkout -b feature/42-fix-navbar
```

### 11. Make Your Changes

Follow the project structure and coding standards.

### 12. Commit and Push

Use a descriptive message including the issue or ticket number:

```bash
git commit -m "feat(issue-42): fix navbar responsiveness"
git push origin feature/42-fix-navbar
```

### 13. Submit a Pull Request (PR)

Navigate to the original repository and click "New Pull Request."
Link the issue your PR addresses and describe your changes.

---

## 🛠️ Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🌟 Community & Support

Join our community to stay updated and collaborate:

- [GitHub Discussions](https://github.com/ETLOnline/spark/discussions)
- \[Slack/Discord (Coming Soon)]

---

## 📜 License

Spark is licensed under the [MIT License](LICENSE).

---

Feel free to suggest changes or improvements to make Spark even better! Let's build something meaningful together. 🌟
