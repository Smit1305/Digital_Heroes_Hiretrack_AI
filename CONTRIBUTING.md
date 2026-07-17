# Contributing to HireTrack AI

First off, thank you for considering contributing to HireTrack AI! 

To maintain high code quality, security standards, and production readiness, we ask that you follow these contribution guidelines.

---

## 🚦 Branching Strategy

We follow a structured branching system:
- **`main`**: Production-ready branch. Only updated via signed-off releases or critical patches.
- **`develop`**: Primary integration branch. All feature branches should merge into this branch.
- **Features / Bug fixes**: Branches should be named using the following prefixes:
  - Feature branch: `feature/brief-description`
  - Bug fix: `bugfix/brief-description`
  - Documentation/Chore: `chore/brief-description`

---

## 🛠️ Local Development Setup

1. Fork and clone the repository.
2. Initialize local dependencies and database:
   ```bash
   npm ci
   npx prisma migrate dev
   npm run db:seed
   ```
3. Run code style check and tests before editing:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

---

## 📝 Commit Messages & Rules

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) standard. Commit formats:

```txt
<type>(<scope>): <description>

[Optional body]
```

### Types
- **`feat`**: A new feature.
- **`fix`**: A bug fix.
- **`docs`**: Documentation adjustments.
- **`style`**: Formatting, missing semi-colons, etc. (no business code changes).
- **`refactor`**: Restructuring code without changing behavior.
- **`test`**: Adding missing tests or refactoring existing tests.
- **`chore`**: Maintenance, build tasks, package updates.

### Examples
- `feat(auth): add google oauth flow`
- `fix(pipeline): resolve drag and drop optimistic rollback crash`

---

## 🔍 Pull Request Guidelines

1. Create a pull request targeting the `develop` branch.
2. Provide a detailed summary using the [pull request template](.github/pull_request_template.md).
3. Ensure all CI checks (linting, typechecks, unit tests, and compilation build) pass successfully.
4. Verify E2E compatibility using `npm run test:e2e` if you have made major UI or routing changes.
