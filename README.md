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
- 🧠 Database using [Postgres] (SQL) and [Drizzle ORM](https://orm.drizzle.team/)
- 💅 Modern styling with [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/)
- 🪳 Object storage using S3-compatible services (e.g., MinIO) and AZURE Blob storage
- 🔄 Real-time interactions using [Ably](https://ably.com/) and pusher
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
npm install
```

### 5. Set up Environment Variables

1. Copy the `.env.example` file to `.env`
2. Replace placeholder values with your own credentials

#### Example `.env` Structure (No Secrets Included):

```env
DB_SSL=true
DB_HOST=host
DB_PORT=port-normally-5432
DB_USER=user
DB_PWD="password"
DB_NAME=spark

WEBHOOK_SECRET=your-webhook-secret

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

ABLY_API_KEY=your-ably-api-key

S3_BUCKET_NAME=your-bucket
S3_REGION=your-region
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_ENDPOINT=your-s3-endpoint

PUSHER_APP_ID=app-id
NEXT_PUBLIC_PUSHER_KEY=key
PUSHER_SECRET=secret
NEXT_PUBLIC_PUSHER_CLUSTER=cluster
```

### 6. Configure Database (Postgres)

### Prerequisites

Before you begin, make sure you have the appropriate package manager for your operating system:

- **macOS**: [Homebrew](https://brew.sh/)
- **Windows**: An internet browser to download the installer.
- **Linux**: `apt` or another package manager.

---

### Installation

Follow the instructions for your specific operating system.

#### macOS (using Homebrew)

1.  **Update Homebrew:**

    ```sh
    brew update
    ```

2.  **Install PostgreSQL:**

    ```sh
    brew install postgresql
    ```

3.  **Start the PostgreSQL service:**
    ```sh
    brew services start postgresql
    ```
    This will start the database server and ensure it launches automatically on login.

#### Windows

1.  **Download the Installer:** Go to the official [PostgreSQL download page](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and download the installer for your version of Windows.

2.  **Run the Installer:**
    - Run the downloaded executable.
    - Follow the setup wizard. You can leave most settings as default.
    - **Important:** During installation, you will be prompted to set a password for the default superuser, `postgres`. **Remember this password**, as you will need it to create other users and databases.
    - The installer will also install `pgAdmin`, a popular GUI tool for managing PostgreSQL.

#### Linux (Debian/Ubuntu)

1.  **Update your package list:**

    ```sh
    sudo apt update
    ```

2.  **Install PostgreSQL and its contribution package:**

    ```sh
    sudo apt install postgresql postgresql-contrib
    ```

3.  The service should start automatically. You can verify its status with:
    ```sh
    sudo systemctl status postgresql
    ```

---

### Initial Setup

After installation, you'll need to access the PostgreSQL command-line prompt, `psql`.

- On **macOS and Linux**, PostgreSQL creates a user named `postgres`. You need to switch to this user to perform administrative tasks.
  ```sh
  sudo -u postgres psql
  ```
- On **Windows**, you can open the "SQL Shell (psql)" application from the Start Menu. It will prompt you for the server, database, port, username, and password. You can accept the defaults and enter the password you set during installation.

---

### Create a Database and User

It's best practice to create a specific user and database for each project. Run these commands from within the `psql` shell.

1.  **Create a new user (role) with a password.** Replace `myuser` and `mypassword` with your desired credentials.

    ```sql
    CREATE ROLE myuser WITH LOGIN PASSWORD 'mypassword';
    ```

2.  **Create a new database.** It's common to name the database after your project. Replace `mydatabase` with your desired name.

    ```sql
    CREATE DATABASE mydatabase;
    ```

3.  **Grant all privileges on the new database to your new user.** This allows your application's user to read, write, and modify the database.

    ```sql
    GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
    ```

4.  **Exit the `psql` shell:**
    ```sql
    \q
    ```

---

### Connect to Your Database

You can now connect directly to your newly created database using the user you created.

- **From your terminal (macOS/Linux):**

  ```sh
  psql -U myuser -d mydatabase -h localhost
  ```

  It will prompt you for the password (`mypassword`).

- **From the SQL Shell (Windows):** Relaunch the shell and enter the new database name and username when prompted.

---

### Example Connection String

Most applications connect to a database using a connection string or URL. Based on the user and database created above, your connection string would look like this:

```
postgresql://myuser:mypassword@localhost:5432/mydatabase
^^^^^^^^^^   ^^^^^^ ^^^^^^^^^   ^^^^^^^  ^^^  ^^^^^^^^
              user   password   host     port  DB_NAME
```

You would need to place this in your project's configuration file ( `.env`).

---

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

Check the [Issues](https://github.com/ETLOnline/spark/issues) tab or Jira for tasks labeled as `good first issue` or `help wanted`.

### 10. Create a Branch

Use the format:

```bash
git checkout -b feature/issue-number-short-description development
```

Example:

```bash
git checkout -b feature/42-fix-navbar development
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
Select development as destination and your branch in from.
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
