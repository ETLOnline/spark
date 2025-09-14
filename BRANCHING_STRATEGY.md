# 🌱 Spark Branching Strategy

This document explains how we manage branches in the **Spark** repository.  
It ensures that contributions stay organized and deployments remain stable.

---

## 🔹 Main Branches

- **`development`**
  - Default branch.
  - All new work (features, bugfixes, chores) merges here first.

- **`deploy-*`**
  - Deployment branches (e.g., staging, production).
  - Created with prefix `deploy-`.
  - Examples:
    - `deploy-staging`
    - `deploy-production`
  - Only updated through pull requests from `development`.

---

## 🔹 Supporting Branches

| Branch Type              | Purpose                                                      | Naming Example              |
| ------------------------ | ------------------------------------------------------------ | --------------------------- |
| **Feature**              | New features or enhancements                                 | `feature/user-profile`      |
| **Bugfix**               | Fixing reported issues                                       | `bugfix/123-login-error`    |
| **Hotfix**               | Urgent fixes on production (branch from `deploy/production`) | `hotfix/payment-timeout`    |
| **Chore**                | Maintenance, docs, or CI/CD updates                          | `chore/update-dependencies` |
| **Release** _(optional)_ | Preparing stable releases                                    | `release/1.0.0`             |

---

## 🔹 Workflow

1. Create a branch from `development`  
   _(except hotfixes → branch from `deploy/production`)_.
2. Commit changes with clear messages (`feat:`, `fix:`, `docs:`, `chore:`).
3. Open a Pull Request (PR) → target `development`.
   - Link the related GitHub Issue.
   - Request a review.
4. Merge rules:
   - `feature/`, `bugfix/`, `chore/` → into `development`.
   - `hotfix/` → into `deploy/production` **and** back into `development`.
   - `development` → into `deploy/*` when ready for deployment.
5. Tag releases on `deploy/production` using **semantic versioning** (e.g., `v1.0.0`).

---

## 🔹 Example Flow

1. Contributor picks up issue **#45** → creates `feature/45-user-auth`.
2. Work, commit, push → PR → merged into `development`.
3. When ready to deploy → merge `development` → `deploy-staging`.
4. After testing → merge `deploy-staging` → `deploy-production`.
5. Tag `v1.2.0` on `deploy-production`.

---

## 🔹 Notes

- **GitHub Issues** are the source of truth for open-source contributions.
- Internal tools (like Jira) may sync issues for the ETL team.
- Eventually, Spark will manage its own roadmap with **Spark’s Project Management module**.

---

✅ This strategy keeps **contributors free to build on `development`**,  
while **deployments are controlled through `deploy-*` branches**.
