# Secure Voting App Overview

## Quick Summary
- **Tech stack**: Next.js + Supabase
- **Auth method**: UUID + bcrypt
- **Vote storage**: Encrypted rows
- **Dashboard**: Real-time WS

## App Purpose
**What this app does**
A secure, single-vote-per-user election platform. An admin creates an election, defines candidates, and generates unique voter credentials (userId + password). Each voter logs in once, casts exactly one vote, and sees a confirmation. A live dashboard shows real-time results with charts and statistics.

## Core Modules
**System components**
- Admin panel
- Voter auth
- Vote casting
- Confirmation receipt
- Live dashboard
- Audit log
- Rate limiter
- Fraud detection

## Stack Choices
**Recommended technologies**
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes + Supabase
- **Database**: PostgreSQL via Supabase
- **Auth**: Custom UUID/bcrypt (no OAuth to keep voters anonymous)
- **Real-time**: Supabase Realtime
- **Charts**: Recharts
- **Deployment**: Vercel
