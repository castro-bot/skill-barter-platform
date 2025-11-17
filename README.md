# SkillBarter Platform - Developer Setup

## 🚀 Project Overview

This is the monorepo for the SkillBarter application, a platform for university students to trade services. This project is the final deliverable for our "Análisis de Requerimientos" and "Análisis y Modelado de Software" courses.

Our architecture is **decoupled**:
1.  A headless `backend` API (Node.js, Express, Prisma)
2.  A `frontend` client (React, Vite)

This structure is non-negotiable and allows us to work in parallel.

## 📁 Project Structure

* `/backend/`: The Node.js API. **This is my domain (Backend Lead).**
* `/frontend/`: The React client. **This is your domain (Frontend Dev).**
* `/docs/`: Our **Single Source of Truth (SSOT)**. All requirements (SRS), UML diagrams, and *especially* the API contract live here.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
* Node.js (LTS version)
* Git
* VS Code (recommended, with `Prettier` and `ESLint` extensions)

## 🏁 Getting Started (Frontend Developer)

Your first task is to set up your `frontend` environment. You do not need to run the backend; you will build your UI against a mock API first.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR-USERNAME/skill-barter-platform.git](https://github.com/YOUR-USERNAME/skill-barter-platform.git)
    cd skill-barter-platform
    ```

2.  **Navigate to your sandbox:**
    ```bash
    cd frontend
    ```
    (This directory is *yours*. Do not work in the `backend` or root folders.)

3.  **Initialize the React project using Vite.**
    * This command will scaffold React, TypeScript, and SWC *inside* the current `frontend` directory.
    ```bash
    npm create vite@latest . -- --template react-ts
    ```

4.  **Install all dependencies:**
    ```bash
    npm install
    ```

5.  **Install core frontend libraries:**
    * We will use `axios` for API calls, `react-router-dom` for navigation, and a UI library for speed.
    ```bash
    # For API calls and routing
    npm install axios react-router-dom

    # For UI components (using Chakra UI as an example, replace if we pick another)
    npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
    ```

6.  **Install our shared dev tooling:**
    ```bash
    npm install --save-dev prettier eslint
    ```

7.  **Run the dev server:**
    ```bash
    npm run dev
    ```
    Your environment is now 100% operational.

## 📖 The "Bible": Our API Contract

Your entire development process relies on the contract defined in:
**`docs/api-contract.md`**

**If it's not in the contract, it doesn't exist.**

Your first development task (Sprint 1) is to create a `src/api/mockClient.ts` file. This file will export fake, async functions that *perfectly* match the API contract (e.g., `login()`, `getServices()`).

This allows you to build the *entire* UI and all its logic without ever running the real backend. This is the key to our parallel workflow.

## 🤝 Our Workflow (Non-Negotiable)

We adhere to a strict development workflow to ensure code quality and prevent merge conflicts.

1.  **Branching:** The `main` branch is sacred. All work *must* be done on a feature branch.
    * **Good:** `feat/login-page`, `fix/navbar-css`
    * **Bad:** Committing directly to `main`.

2.  **Pull Requests (PRs):** All code must be merged to `main` via a Pull Request.
    * When you finish a feature, push your branch and open a PR.
    * Tag me (`@your-github-username`) for review.

3.  **Code Reviews:** I will review and approve your PRs. You will review and approve mine. This is our primary quality gate.

4.  **Linting:** `Prettier` and `ESLint` are installed. **Configure your VS Code to format on save.** All PRs must pass the linter.

## 🧑‍💻 Roles & Responsibilities

* **Dev 1 (Backend Lead - Me):**
    * Owns the `backend/` directory.
    * Implements all API endpoints as defined in the contract.
    * Manages the database schema (`schema.prisma`).
    * Implements all server-side patterns (Repository, Observer, Factory).

* **Dev 2 (Frontend Dev - You):**
    * Owns the `frontend/` directory.
    * Implements all UI/UX (pages, components).
    * Manages all client-side state.
    * Consumes the API (first mock, then real).