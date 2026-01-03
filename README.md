# Startege - AI Governance Learning Platform

A comprehensive, gamified web application for learning AI Governance, designed to help users understand AI governance concepts and prepare for the AI Governance Professional (AIGP) certification exam.

## 🎯 Features

- **360+ Concept Cards** - Interactive learning modules organized by domain and difficulty
- **40 Mastery Exams** - Comprehensive exams with incremental level progression
- **AIGP Prep Exams** - Full-length practice exams aligned with AIGP certification blueprint
- **Startegizer AI Assistant** - Premium AI tutor powered by Gemini
- **Market Scan** - Real-time regulatory intelligence and updates
- **Gamification** - Points, badges, streaks, and progress tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Google Cloud SQL)
- **Authentication**: Firebase Authentication
- **Payments**: Stripe
- **AI/ML**: Google Vertex AI (Gemini), OpenAI/ChatGPT
- **Hosting**: Ready for Vercel, Google Cloud Run, or other platforms

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Firebase project
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fasahat78/startege.git
cd startege
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Run the development server:
```bash
npm run dev
```

## 📚 Documentation

- [Production Readiness Checklist](./docs/PRODUCTION_READINESS_CHECKLIST.md)
- [GitHub Setup Guide](./docs/GITHUB_SETUP.md)
- [GitHub Secrets Setup](./docs/GITHUB_SECRETS_SETUP.md)
- [Database Backup Strategy](./docs/DATABASE_BACKUP_STRATEGY.md)

## 🔒 Security

- Rate limiting on critical endpoints
- Environment variables via GitHub Secrets
- Secure session cookies (HTTPS in production)
- Input validation and sanitization

## 📊 Production Status

✅ **Production Ready** - All critical and important items complete

- Health check endpoint: `/api/health`
- Rate limiting implemented
- Error tracking structure ready
- Analytics structure ready
- CORS configured
- Database backup strategy documented

## 🤝 Contributing

This is a private repository. For questions or issues, please contact the repository owner.

## 📄 License

ISC

## 🔗 Links

- **Repository**: https://github.com/fasahat78/startege
- **Production URL**: [Configure in GitHub Secrets]

---

Built with ❤️ for AI Governance education
