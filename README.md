# 🗳️ Secure Voting System

A production-grade, privacy-preserving voting platform built with **Next.js 14**, **Tailwind CSS**, and **Supabase**. This system is designed for high-integrity elections with features like automatic photo audits, bulk credential distribution, and real-time result visualization.

## ✨ Key Features

### 👤 For Voters
- **Secure Authentication**: Access via unique Voter ID and random 12-character passwords.
- **Privacy-First**: Anonymous ballot casting using PostgreSQL stored procedures.
- **Audit Verification**: Every vote generates a unique receipt token for verification.
- **Security Audit**: Automatic photo capture during the voting process for identity verification.

### 🛡️ For Administrators
- **Election Management**: Create and manage multiple elections with customizable candidates.
- **Voter Generation**: Bulk generate credentials and send them via **Nodemailer/SMTP** to student emails.
- **Live Dashboard**: Real-time stats including Votes Cast, Turnout %, and Candidate Performance.
- **Visibility Control**: Ability to "Freeze" the public dashboard until final results are verified.
- **Security Audit Log**: Comprehensive logs of every login, vote, and fraud attempt, including:
  - Voter photos (with hover-zoom preview).
  - Accurate IP detection.
  - Device/Browser identification (Mobile, Desktop, OS version).
  - Multi-level filtering (by event type, election, etc.).

## 🚀 Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React.
- **Backend**: Next.js API Routes, PostgreSQL Stored Procedures.
- **Database & Storage**: Supabase (Database + Storage + Auth).
- **Email**: Nodemailer (SMTP).
- **Security**: Bcrypt.js, JWT, Row Level Security (RLS).

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- Supabase Account
- SMTP Server (e.g., Gmail App Password)

### 2. Environment Setup
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env.local
```

### 3. Database Setup
Run the SQL migrations provided in the `dataScheme.md` file (or the latest updates provided in logs) in your Supabase SQL Editor. This includes:
- Creating `elections`, `candidates`, `voters`, `voter_sessions`, `votes`, and `audit_log` tables.
- Creating the `cast_vote` atomic stored procedure.

### 4. Storage Setup
Create a **Private** bucket in Supabase Storage named `audit-photos`.

### 5. Installation
```bash
npm install
npm run dev
```

## 🔒 Security Principles
- **Anonymity**: The link between a voter and their specific vote is never stored.
- **Integrity**: Transactional updates ensure no vote is lost and no voter can vote twice.
- **Auditability**: Forensic data (IP, Device, Photo) is captured for every success and failure.

---
Built by [Uday](https://github.com/Uday2027)
