# Smart Task Evaluator 

<div align="center">

![Smart Task Evaluator Banner](https://img.shields.io/badge/Smart%20Task%20Evaluator-AI%20Powered%20Code%20Review-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-✓-blue)

**AI-powered code evaluation platform with premium insights**

[Live Demo](https://smart-task-eval.vercel.app) · [Report Bug](https://github.com/yourusername/smart-task-eval/issues) · [Request Feature](https://github.com/yourusername/smart-task-eval/issues)

</div>

## ✨ Features

### 🎯 Core Features
- **AI-Powered Code Analysis**: Leverages Groq's Llama 3.3 70B model for intelligent code evaluation
- **Instant Scoring**: Get immediate scores (1-10) for your code submissions
- **Multi-Language Support**: Evaluates code across multiple programming languages
- **Secure Payment Gateway**: Integrated Razorpay for premium feature unlocks

### 💎 Premium Features (Unlock with Payment)
- **Detailed AI Review**: Comprehensive analysis of your code
- **Strengths & Weaknesses**: Identify what you did well and areas for improvement
- **Optimization Tips**: Performance and best practice suggestions
- **Actionable Insights**: Clear guidance for next steps

### 🛡️ Technical Excellence
- **TypeSafe Development**: Full TypeScript implementation
- **Real-time Updates**: Auto-refresh during evaluation processing
- **Secure Authentication**: Supabase Auth with Row Level Security
- **Responsive Design**: Beautiful UI across all devices

## 📸 Screenshots

<div align="center">

| Dashboard | Code Submission | Results | Payment |
|-----------|----------------|---------|---------|
| ![Dashboard](https://via.placeholder.com/400x250/1e293b/ffffff?text=Dashboard+View) | ![Submission](https://via.placeholder.com/400x250/1e293b/ffffff?text=Code+Submission) | ![Results](https://via.placeholder.com/400x250/1e293b/ffffff?text=Evaluation+Results) | ![Payment](https://via.placeholder.com/400x250/1e293b/ffffff?text=Payment+Gateway) |

</div>

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Groq API key
- Razorpay account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-task-eval.git
cd smart-task-eval
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL_NAME=llama-3.3-70b-versatile

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_key_id
```

4. **Set up database**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    code_text TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE evaluations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    score INTEGER,
    summary TEXT,
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    is_unlocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id)
);

CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'created',
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  • App Router with TypeScript                               │
│  • React Query for data fetching                            │
│  • Tailwind CSS for styling                                 │
│  • Lucide React for icons                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     API Layer (Edge Functions)              │
├─────────────────────────────────────────────────────────────┤
│  • /api/evaluate - AI code analysis                         │
│  • /api/payment/create-order - Razorpay order creation      │
│  • /api/payment/verify - Payment verification               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      External Services                      │
├─────────────┬─────────────┬────────────────┬────────────────┤
│   Supabase  │    Groq     │   Razorpay     │  Authentication │
│   Database  │     AI      │   Payments     │     (Auth)     │
└─────────────┴─────────────┴────────────────┴────────────────┘
```

## 🔧 API Reference

### POST `/api/evaluate`
Evaluates code using AI

**Request:**
```json
{
  "taskId": "uuid",
  "code": "your code here",
  "language": "javascript",
  "description": "optional description"
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "score": 8,
    "summary": "Detailed analysis...",
    "strengths": ["Clean code", "Good structure"],
    "improvements": ["Add comments", "Optimize loops"],
    "is_unlocked": false
  }
}
```

### POST `/api/payment/create-order`
Creates a Razorpay payment order

**Request:**
```json
{
  "taskId": "uuid",
  "amount": 10
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_XXXXXXXXXXXXXX",
  "amount": 1000,
  "currency": "INR",
  "key": "rzp_test_XXXXXXXXXXXX"
}
```

### POST `/api/payment/verify`
Verifies payment and unlocks evaluation

**Request:**
```json
{
  "orderId": "order_XXXXXXXXXXXXXX",
  "paymentId": "pay_XXXXXXXXXXXXXX",
  "signature": "xxxxxxxxxxxxxxxx",
  "taskId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and evaluation unlocked"
}
```

## 💳 Payment Flow

1. **User submits code** → Free basic evaluation with score
2. **User requests detailed review** → Payment gateway appears
3. **User pays ₹10** via Razorpay
4. **Payment verified** → Evaluation unlocked
5. **User accesses premium content** → Detailed analysis available

**Test Mode:** Use card `4111 1111 1111 1111` for testing

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📊 Database Schema

```sql
-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    code_text TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY,
    task_id UUID UNIQUE REFERENCES tasks(id),
    score INTEGER,
    summary TEXT,
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    is_unlocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    task_id UUID REFERENCES tasks(id),
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'created',
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Environment Variables on Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

### Build for Production
```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for AI capabilities
- [Supabase](https://supabase.com/) for backend services
- [Razorpay](https://razorpay.com/) for payment processing
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🔗 Links

- [Live Demo](https://smart-task-eval.vercel.app)
- [Issue Tracker](https://github.com/yourusername/smart-task-eval/issues)
- [Changelog](CHANGELOG.md)

---

<div align="center">

### ⭐ Don't forget to star this repo if you found it helpful!

**Built with ❤️ and lots of ☕**

</div>
