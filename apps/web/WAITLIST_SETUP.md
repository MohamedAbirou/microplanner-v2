# 📧 Waitlist Setup Guide

This guide explains how to fully enable the waitlist system with database storage and email confirmations.

## 🗄️ Database Setup (Prisma)

### 1. Generate Prisma Client

```bash
# From project root
pnpm prisma generate
```

### 2. Run Database Migration

```bash
# Create migration
pnpm prisma migrate dev --name add_waitlist_model

# Or apply existing migrations
pnpm prisma migrate deploy
```

### 3. Enable Database in API Route

In `apps/web/app/api/waitlist/route.ts`, uncomment the database section (lines 27-64):

```typescript
// Uncomment this section:
const { PrismaClient } = await import('@microplanner/database');
const prisma = new PrismaClient();

try {
  // Check if email already exists
  const existing = await prisma.waitlist.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Email already registered on waitlist' },
      { status: 409 }
    );
  }

  // Get current waitlist count for position
  const position = await prisma.waitlist.count() + 1;

  // Create waitlist entry
  await prisma.waitlist.create({
    data: {
      email,
      name,
      useCase,
      referralSource,
      position,
      status: 'PENDING',
    },
  });
} finally {
  await prisma.$disconnect();
}
```

---

## 📧 Email Service Setup

### Option 1: Resend (Recommended)

1. **Sign up**: https://resend.com
2. **Get API key**: Dashboard → API Keys
3. **Add to `.env.local`**:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

4. **Install Resend**:
   ```bash
   pnpm add resend
   ```

5. **Uncomment email section** in `apps/web/app/api/waitlist/route.ts` (lines 66-92)

### Option 2: SendGrid

1. **Sign up**: https://sendgrid.com
2. **Get API key**: Settings → API Keys
3. **Add to `.env.local`**:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

4. **Install SendGrid**:
   ```bash
   pnpm add @sendgrid/mail
   ```

5. **Replace Resend code** with SendGrid:
   ```typescript
   if (process.env.SENDGRID_API_KEY) {
     const sgMail = (await import('@sendgrid/mail')).default;
     sgMail.setApiKey(process.env.SENDGRID_API_KEY);

     await sgMail.send({
       from: 'hello@microplanner.ai',
       to: email,
       subject: "You're on the MicroPlanner waitlist! 🎉",
       html: `...`,
     });
   }
   ```

---

## 🔔 Slack Notifications (Optional)

Get notified instantly when someone joins the waitlist!

### Setup

1. **Create Slack Incoming Webhook**:
   - Go to: https://api.slack.com/messaging/webhooks
   - Create a new webhook
   - Copy the webhook URL

2. **Add to `.env.local`**:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxxxxxxxxxx
   ```

3. **Uncomment Slack section** in `apps/web/app/api/waitlist/route.ts` (lines 94-106)

---

## ✅ Testing

### Test Waitlist Signup

```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "useCase": "personal"
  }'
```

### Test Waitlist Count

```bash
curl http://localhost:3000/api/waitlist
```

### Check Database

```bash
pnpm prisma studio
```

Navigate to `Waitlist` model to see signups.

---

## 📊 Waitlist Dashboard (Future)

You can create an admin dashboard to manage waitlist:

### Useful Queries

```typescript
// Get all pending signups
const pending = await prisma.waitlist.findMany({
  where: { status: 'PENDING' },
  orderBy: { createdAt: 'asc' },
});

// Get total count
const total = await prisma.waitlist.count();

// Invite users
await prisma.waitlist.update({
  where: { id: 'xxx' },
  data: {
    status: 'INVITED',
    invitedAt: new Date(),
  },
});

// Mark as converted
await prisma.waitlist.update({
  where: { email: 'user@example.com' },
  data: {
    status: 'CONVERTED',
    convertedAt: new Date(),
  },
});
```

---

## 🚀 Production Checklist

- [ ] Database migrations applied
- [ ] Prisma client generated
- [ ] Email service configured (Resend/SendGrid)
- [ ] Email templates customized
- [ ] Slack notifications set up (optional)
- [ ] Test all functionality
- [ ] Set up admin dashboard
- [ ] Configure rate limiting (prevent spam)
- [ ] Add email verification (optional)
- [ ] Set up analytics tracking

---

## 🔒 Security Best Practices

1. **Rate Limiting**: Implement rate limiting to prevent spam
   ```typescript
   // Use @vercel/edge or express-rate-limit
   ```

2. **Email Validation**: Use a service like ZeroBounce or Hunter.io to verify emails

3. **Spam Protection**: Add hCaptcha or reCAPTCHA to the form

4. **GDPR Compliance**: Add privacy policy link and consent checkbox

---

## 📝 Environment Variables Summary

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Email Service (choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxxxxxxxxxx
```

---

## 🎉 You're All Set!

Your waitlist system is now ready to collect early access signups with:
- ✅ Database storage
- ✅ Email confirmations
- ✅ Slack notifications
- ✅ Position tracking
- ✅ Status management

Happy launching! 🚀
