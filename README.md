# BookLeaf Author Support & Communication Portal

A full-stack support portal for BookLeaf Publishing that helps authors
raise and track support requests while giving the operations team a
centralized ticket queue with AI-assisted classification and response
drafting.

> **Assignment context:** This project was built for BookLeaf
> Publishing's confidential Full-Stack Developer technical assignment.
> Keep the source repository private and do not publish the assignment
> or solution publicly.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [How the Ticket Workflow Works](#how-the-ticket-workflow-works)
- [AI Integration](#ai-integration)
- [Authentication and
  Authorization](#authentication-and-authorization)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Add-ons](#Add-ons)
- [ChatBot](#AI-Powered-Account-Assistant)

## Overview

BookLeaf works with authors across India and the United States. Authors
may need help with royalties, book metadata and ISBNs, printing quality,
distribution, and production progress. This application provides two
role-based experiences:

- **Author portal:** Authors can view their books, submit support
  tickets, and follow conversations and ticket status.
- **Admin portal:** The support team can review incoming tickets,
  filter the queue, update ticket status and priority, respond to
  authors, add internal notes, and generate AI-assisted reply drafts.

The application uses a REST API backed by MongoDB. The backend is
responsible for data access, authentication, authorization, validation,
and AI-provider calls.

## Features

### Author portal

- Email and password login.
- Book dashboard with publication and royalty information from the
  supplied sample dataset.
- Support-ticket creation with a selected book, subject, and detailed
  description.
- Ticket list and ticket detail views.
- Replies and ticket status visibility.
- Tickets associated with the authenticated author.

### Admin portal

- Central ticket queue across authors.
- Filtering by status, category, priority, and text search.
- Ticket status and priority updates.
- Replies to authors.
- Internal notes intended for the admin team only.
- Ticket analytics for dashboard summaries.
- AI-assisted ticket classification and reply drafting.
- Email notification when ticket status or priority changes, when
  email configuration is available.

### Ticket lifecycle

Tickets use the following statuses:

- `Open`
- `In Progress`
- `Waiting for Author`
- `Resolved`
- `Closed`

Ticket priorities are `Critical`, `High`, `Medium`, and `Low`.

The ticket schema also supports assignment information, message history,
AI-generated draft text, AI classification, AI priority, and internal
notes.

## Technology Stack

---

Layer Technology

---

Frontend React

Backend Node.js and Express

Database MongoDB with Mongoose

Authentication Email/password and JSON Web Tokens
(JWT)

Password hashing bcrypt

AI integration Google Gemini API through
`@google/genai`

Email Nodemailer

Classification fallback Rule-based classification utility

Deployment Frontend and backend can be
deployed separately (for example,
Netlify and Render)

---

## Architecture

```text
React frontend
    |
    | HTTPS / JSON REST requests
    | Authorization: Bearer <JWT>
    v
Express API
    |
    +-- Authentication routes
    |      +-- Validate author/admin credentials
    |      +-- Issue signed JWT
    |
    +-- Authentication middleware
    |      +-- Verify token
    |      +-- Attach authenticated identity to req.user
    |
    +-- Role middleware
    |      +-- Restrict admin-only endpoints
    |
    +-- Ticket routes
    |      +-- Ticket CRUD and conversation workflow
    |      +-- Ownership checks for author operations
    |      +-- AI classification and reply drafting
    |      +-- Email notifications
    |
    +--------------------+---------------------+
    |                    |                     |
    v                    v                     v
 MongoDB             Gemini API            SMTP provider
 Authors, books,     Classification        Email alerts
 tickets             and draft replies
```

### Design decisions

- **React + Express:** A JavaScript stack across the frontend and
  backend keeps development consistent and supports a straightforward
  REST API.
- **MongoDB + Mongoose:** The ticket schema naturally stores
  conversation messages and internal notes as embedded arrays, while
  each ticket references its author.
- **JWT authentication:** The API can authenticate requests without
  maintaining a server-side session for each request.
- **Role-based middleware:** Authentication and authorization are
  separated so a valid login does not automatically grant admin
  privileges.
- **AI fallback:** Ticket creation should remain available when the AI
  provider is unavailable; rule-based classification can be used as a
  fallback.
- **Server-side secrets:** AI keys,Email credentials , JWT secrets, and admin credential
  configuration belong in backend environment variables, never in
  frontend code.

## How the Ticket Workflow Works

1.  An author signs in with email and password.
2.  The backend verifies the credentials and returns a JWT.
3.  The frontend includes the token in the `Authorization` header for
    protected requests.
4.  The author submits a ticket. The backend derives the author identity
    from the verified token rather than trusting an author ID supplied
    by the browser.
5.  The backend applies rule-based classification and attempts AI
    classification. If the AI call fails, the fallback result is
    retained so ticket submission can continue.
6.  An admin reviews the ticket, updates status or priority, and can
    request an AI-generated reply draft.
7.  The admin reviews and edits the draft before sending a reply.
8.  The author can view the ticket conversation and status updates.
    Email notifications may also be sent for status or priority changes.

## AI Integration

AI is used to assist the support workflow rather than to make final
decisions without human review.

### Classification

The backend includes a rule-based classifier and a Gemini-powered
classification utility. The rule-based result is used as a fallback if
the AI call fails. The intended categories in the assignment are:

- Royalty & Payments
- ISBN & Metadata Issues
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

**Implementation note:** The ticket schema and current route code use a
shorter category list (`Royalty`, `Publishing`, `Book Changes`,
`Marketing`, `Distribution`, `Other`).

### Draft responses

The backend sends the ticket subject, description, and category to
Gemini to generate a suggested response. The prompt asks for a
professional, empathetic, concise BookLeaf support response and
instructs the model not to invent policies or actions. The admin should
review and edit the suggestion before sending it to an author.

### Error handling and cost awareness

- Classification has a rule-based fallback if the AI call fails.
- Ticket creation should not depend on successful AI response
  generation.
- Draft generation should return a meaningful error if the provider is
  unavailable or returns an empty response.
- Keep prompts focused on the current ticket and only the context
  needed for the task. Avoid sending unrelated ticket histories or
  unnecessary personal data.
- Consider request timeouts, rate limiting, retry policies, token
  limits, and usage logging before production use.

### Model choice

Gemini is used through Google's `@google/genai` SDK. It is integrated on
the backend, allowing the API key to remain server-side.

## Authentication and Authorization

The API uses JWTs to identify the user making a request. The backend
verifies the token and attaches the decoded identity and role to
`req.user`. Role middleware restricts admin operations.

Example request header:

```http
Authorization: Bearer <your-jwt-token>
```

Expected access rules:

- **Author:** Can read their own books and tickets, create tickets for
  themselves, and reply to their own tickets.
- **Admin:** Can view the global ticket queue, update ticket status
  and priority, respond to authors, access analytics, and manage
  internal notes and AI drafts.
- **Unauthenticated request:** Should be rejected with
  `401 Unauthorized`.
- **Authenticated but unauthorized request:** Should be rejected with
  `403 Forbidden`.

### Important security checks before submission

- Protect every non-public API route with authentication middleware.
- Apply role middleware to admin endpoints.
- Query author tickets using the authenticated user's database ID, not
  a client-supplied author ID.
- For a ticket detail or reply request, verify both the ticket
  identifier and ownership.
- Never return `internalNotes` to authors.
- Do not accept `senderRole`, admin identity, or author ownership from
  an untrusted client.
- Keep passwords hashed with bcrypt and never return password hashes
  in API responses.
- Store `JWT_SECRET`, AI keys, and email credentials in environment
  variables.
- Use a strong admin password hash in production;

## Data Models

- Author
- Book
- Ticket

### Author

The author model includes fields such as author ID, name, email, phone,
city, profile photo URL, and joined date. Authentication also requires a
hashed password field.

### Book

The book model represents the sample dataset's book and publishing
information, including title, ISBN, genre, publication date/status, MRP,
sales, and royalty figures.

### Ticket

A ticket contains:

- `ticket_id`: Human-readable ticket identifier.
- `book_name`: Related book or general/account-level context.
- `author`: MongoDB ObjectId reference to the author.
- `subject`, `description`, `category`, `priority`, and `status`.
- `assignedTo`: Assignment information.
- `messages`: Author/admin conversation history.
- `aiDraftResponse`, `aiClassification`, and `aiPriority`.
- `internalNotes`: Admin-only discussion.
- Mongoose `createdAt` and `updatedAt` timestamps.

## Getting Started

### Prerequisites

- Node.js (use a current LTS version)
- npm
- MongoDB Atlas account or a local MongoDB instance
- Gemini API key for AI features
- SMTP credentials if email notifications are to be tested

### 1. Clone the private repository

```bash
git clone <YOUR_PRIVATE_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Keep the repository private because the assignment is confidential.

### 2. Configure the backend

Move to the backend directory (replace `backend` with the actual folder
name if different):

```bash
cd backend
npm install
```

Create a `.env` file in the backend root. Use the environment variables
listed below and copy any additional required variable names from the
backend configuration.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file required by your setup. Configure
the API base URL to point to the local backend, for example:

```env
VITE_API_BASE_URL=${import.meta.env.VITE_API_URL}
```

If the project uses Create React App or a different variable name, use
the prefix and variable actually referenced by the frontend source code.

### 4. Start the backend

From the backend directory, use the start script defined in
`package.json`. Common examples are:

```bash
npm run dev
```

or:

```bash
npm start
```

### 5. Start the frontend

From the frontend directory:

```bash
npm run dev
```

For a Create React App project, the command may instead be:

```bash
npm start
```

Open the local URL printed by the frontend development server.

### 6. Seed the sample data

The assignment provides a dataset of 10 authors and 18 books. Run the
repository's seed/init script to load the provided records. **Inspect
the script before running it:** if it deletes existing Author, Book, or
Ticket records, use it only against a development database.

If demo passwords are generated from author first names in the seed
script, those are development-only credentials and must not be reused in
production.

## Environment Variables

The backend `.env` file may contain variables like the following. Use
the exact names read by the code and do not commit secret values.

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>

ADMIN_EMAIL=admin@bookleaf.com
ADMIN_PASSWORD_HASH=<bcrypt-hash-of-admin-password>

GEMINI_API_KEY=<your-gemini-api-key>

# Add the SMTP variables required by utils/sendEmail.js, for example:
SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
```

Notes:

- `MONGODB_URI` may have a different name in the existing backend;
  match the actual code.
- `ADMIN_PASSWORD_HASH` should be a bcrypt hash, not a plaintext
  password.
- SMTP variable names depend on `utils/sendEmail.js`; use the names it
  expects.
- Never put backend secrets in frontend environment variables.
  Frontend variables are bundled into client assets and are not
  secret.
- Add `.env` files to `.gitignore`. Commit an `.env.example`
  containing variable names and safe placeholders, not real secrets.

## Demo Accounts

Fill in these values after creating and testing the deployed demo. Do
not publish real passwords or hashes in this file.

---

Role Login email Password

---

Admin `<configured admin email>` `<provide a dedicated demo password securely>`

Author `<one seeded author's email>` `<the password configured by the seed process>`

---

For the live evaluation, provide working demo credentials as requested
by the assignment. Use dedicated demo accounts, avoid personal
credentials, and ensure the seeded data is present on the deployed
database.

**Live demo:** `<ADD_DEPLOYED_FRONTEND_URL>`

## API Reference

The following paths are based on the ticket routes currently implemented
in the project. They assume the router is mounted at `/api/tickets`;
confirm the mount path in the Express app before using them. Protect the
routes as described in the authorization column before submission.

All protected requests should include:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

Method Path Purpose Intended access

---

`POST` `/api/auth/login` Authenticate an Public
author or admin  
 and receive a JWT

`GET` `/api/tickets/author/me` List the Author
logged-in  
 author's tickets

`GET` `/api/tickets/:ticketId` Fetch ticket Owning author or
details admin

`POST` `/api/tickets/` Create a ticket Author

`POST` `/api/tickets/:ticketId/replies` Add an author Owning author
reply

`POST` `/api/tickets/:ticketId/reply` Add an admin Admin
reply

`GET` `/api/tickets/admin/all` Fetch/filter the Admin
global ticket  
 queue

`PATCH` `/api/tickets/admin/:ticketId` Update status Admin
and/or priority

`POST` `/api/tickets/:id/internal-notes` Add an internal Admin
note

`POST` `/api/tickets/:id/ai-draft` Generate an AI Admin
reply draft

`GET` `/api/tickets/admin/analytics` Fetch ticket Admin
analytics

`POST` `/api/tickets/AI-cat` Classify text Restrict
with AI according to
intended use

---

### Request examples

**Login**

```json
{
  "email": "author@example.com",
  "password": "your-password",
  "role": "author"
}
```

**Create a ticket** (the backend should derive the author from the
token)

```json
{
  "selectedBook": "Example Book",
  "subject": "Question about my royalty",
  "description": "Could you please explain my latest royalty calculation?"
}
```

**Update a ticket as admin**

```json
{
  "status": "In Progress",
  "priority": "High"
}
```

Responses should use appropriate HTTP status codes and meaningful
messages. Common codes include `200` for successful reads/updates, `201`
for creation, `400` for invalid input, `401` for missing/invalid
authentication, `403` for insufficient permissions, `404` for a missing
or inaccessible ticket, and `500` for unexpected server errors.

## Deployment

A typical deployment arrangement is:

- **Frontend:** Netlify
- **Backend:** Render
- **Database:** MongoDB Atlas

## Add-ons

- AI Chatbot
- Profile Images
- Book cover Page Images

To make the UI more appealing and authentic, I generated book cover images
using AI and added a profile image for every author.

### AI-Powered-Account-Assistant

Implemented an AI chatbot that answers authors' questions about their account
details, including book information, royalty earnings, payment status, and
publishing progress, providing personalized responses based on their account
data.

## Confidentiality

This assignment and the implementation are intended for evaluation by
BookLeaf Publishing. Keep the repository private and share it only with
the intended evaluators.
