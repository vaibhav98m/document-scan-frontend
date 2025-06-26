# 📄 Document Scan - AI-Powered Document Analysis Platform

A modern React + TypeScript + Vite application that provides intelligent document analysis with AI-powered insights, summaries, and interactive Q&A capabilities.

## ✨ Features

### 🔐 **Authentication System**

- **OTP-based Login/Signup** - Secure authentication without passwords
- **Email & Phone Support** - Login with either email or phone number
- **120-second OTP Timer** - With resend functionality
- **JWT Token Management** - Automatic token refresh and session handling
- **Guest-friendly Flow** - No forced authentication, browse freely

### 👥 **User Access Levels**

#### 🚶 **Guest Users**

- ✅ **Browse all pages freely** - No authentication barriers
- ✅ Upload documents **≤ 1MB** (PDF, DOCX, XLSX, Images, TXT)
- ✅ **15 uploads per day** (tracked via localStorage with daily reset)
- ✅ Basic document analysis features
- ✅ **Smart restriction system** - Banners only appear when limits are hit
- ⚠️ Upgrade prompts with clear value propositions

#### 🔑 **Authenticated Users**

- ✅ **Unlimited file size** uploads (up to 50MB)
- ✅ **No daily upload limits**
- ✅ Full access to all premium features
- ✅ Document history and sharing
- ✅ Advanced AI analysis capabilities

### 🤖 **AI-Powered Analysis**

#### 📊 **Document Summary**

- **AI-generated summaries** with key points extraction
- **Audio playback** with Text-to-Speech integration
- **Progress tracking** and playback controls
- **Download & Email** functionality for reports

#### 🧠 **Key Insights Extraction**

- **Priority-based insights** (High, Medium, Low)
- **Categorized findings** (Strategic, Financial, Legal, etc.)
- **Relevance scoring** with visual indicators
- **Interactive audio playback** for each insight
- **Comprehensive reporting** with export options

#### 💬 **Interactive Q&A**

- **Chat interface** for document queries
- **Conversation history** preserved per document
- **Context-aware responses** from AI
- **Audio playback** for responses

### 🎨 **Modern UI/UX**

- **Dark/Light mode** with system preference detection
- **Fully responsive design** - Optimized for mobile, tablet, and desktop
- **Mobile-first approach** with touch-friendly interfaces
- **Adaptive tab layout** - Stacked on mobile, horizontal on desktop
- **Purple/Blue gradient** brand theme
- **Smooth animations** and transitions
- **Accessible design** with ARIA labels and keyboard navigation
- **Progressive enhancement** for different screen sizes

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd document-scan
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   VITE_BACKEND_BASE_URL=http://localhost:8080/api
   ```

4. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run tests
npm run test

# Format code
npm run format.fix
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── auth/            # Authentication forms
│   ├── DocumentViewer.tsx
│   ├── UploadSection.tsx
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── DocumentCacheContext.tsx
├── hooks/               # Custom React hooks
│   ├── useTextToSpeech.ts
│   ├── useOTPTimer.ts
│   └── ...
├── pages/               # Application pages
│   ├── DocumentScan.tsx
│   ├── LoginSignupPage.tsx
│   └── ...
├── services/            # API services
│   ├── api.ts
│   ├── authApi.ts
│   └── guestUsageService.ts
├── types/               # TypeScript type definitions
│   ├── index.ts
│   ├── auth.ts
│   └── guestUsage.ts
└── lib/                 # Utility functions
    └── utils.ts
```

## 🔌 API Integration

### Authentication Endpoints

#### **Send OTP**

```http
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "error": null,
  "data": {
    "otpSent": true,
    "expiresIn": 120
  }
}
```

#### **Verify OTP**

```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "OTP verified successfully",
  "error": null,
  "data": {
    "verified": true
  }
}
```

#### **User Signup**

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User onboarded successfully",
  "error": null,
  "data": {
    "id": 6,
    "name": "John Doe",
    "email": "user@example.com",
    "createdAt": "2025-01-24T18:46:29.961+00:00"
  }
}
```

#### **User Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Login successful",
  "error": null,
  "data": {
    "user": {
      "id": 6,
      "name": "John Doe",
      "email": "user@example.com",
      "createdAt": "2025-01-24T18:46:29.961+00:00"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Document Processing

#### **Upload Document**

```http
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData: {
  file: <binary-file-data>
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Document uploaded successfully",
  "error": null,
  "data": {
    "id": "doc_123",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "uploadedAt": "2025-01-24T18:46:29.961+00:00"
  }
}
```

#### **Generate Summary**

```http
POST /api/documents/{id}/summary
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "message": "Summary generated successfully",
  "error": null,
  "data": {
    "id": "summary_123",
    "documentId": "doc_123",
    "content": "This document discusses...",
    "keyPoints": ["Point 1", "Point 2"],
    "generatedAt": "2025-01-24T18:46:29.961+00:00"
  }
}
```

#### **Extract Insights**

```http
POST /api/documents/{id}/insights
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "message": "Insights extracted successfully",
  "error": null,
  "data": {
    "id": "insights_123",
    "documentId": "doc_123",
    "insights": [
      {
        "id": "insight_1",
        "type": "strategic",
        "priority": "high",
        "content": "Critical strategic decision identified",
        "relevance": 0.95,
        "context": "Found in executive summary"
      }
    ],
    "generatedAt": "2025-01-24T18:46:29.961+00:00"
  }
}
```

## ⚙️ Configuration & Customization

### 🔧 **Adjust File Size Limits**

Edit `src/services/guestUsageService.ts`:

```typescript
const MAX_FILE_SIZE_GUEST = 2 * 1024 * 1024; // Change to 2MB
```

### 📊 **Modify Daily Upload Limits**

Edit `src/services/guestUsageService.ts`:

```typescript
const MAX_DAILY_UPLOADS_GUEST = 25; // Change to 25 uploads
```

### 🚨 **Guest Restriction Behavior**

The application implements smart restriction handling:

- **No banners on page load** - Clean initial experience
- **Triggered restrictions only** - Banners appear when limits are hit
- **Contextual messaging** - Different messages for file size vs daily limits
- **Dismissible alerts** - Users can close banners per session
- **Clear upgrade paths** - Login/signup buttons with benefit explanations

### ⏱️ **Customize OTP Timer**

Edit `src/hooks/useOTPTimer.ts`:

```typescript
export const useOTPTimer = (initialTime: number = 180) // Change to 3 minutes
```

### 🎨 **Theme Customization**

Update `tailwind.config.ts` for custom colors:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(220, 83%, 58%)", // Custom primary color
      }
    }
  }
}
```

### 📧 **Email Configuration**

Update `.env` for email service:

```env
VITE_EMAIL_SERVICE_URL=https://api.emailservice.com
VITE_EMAIL_API_KEY=your-api-key
```

## 🔒 Security Features

- **Client-side validation** for file sizes and types
- **Rate limiting** for guest users (localStorage-based)
- **JWT token management** with automatic refresh
- **Secure OTP generation** and validation
- **CORS protection** and proper headers
- **Input sanitization** and validation

## 🌐 Browser Support

### **Desktop Browsers**

- **Chrome** (Latest) - Full feature support
- **Firefox** (Latest) - Full feature support
- **Safari** (Latest) - Full feature support
- **Edge** (Latest) - Full feature support

### **Mobile Browsers**

- **iOS Safari** (iOS 14+) - Optimized touch interface
- **Chrome Mobile** (Android 8+) - Native file upload support
- **Samsung Internet** - Full compatibility
- **Firefox Mobile** - Complete feature set

### **Responsive Breakpoints**

- **Mobile**: < 768px (Single column, stacked tabs)
- **Tablet**: 768px - 991px (Hybrid layout)
- **Desktop**: > 991px (Full multi-column layout)

## 📱 Mobile Features

- **Touch-friendly interface** with proper spacing and large touch targets
- **Responsive file upload** with drag-and-drop support
- **Mobile-optimized modals** and forms with proper viewport handling
- **Adaptive tab layout** - Vertical stack on mobile, horizontal on desktop
- **Responsive restrictions banners** - Properly sized for mobile screens
- **Swipe gestures** for navigation and interactions
- **Mobile-first responsive breakpoints** at 991px and below
- **Optimized performance** for mobile devices with efficient rendering

## 🚀 Deployment

### **Build for Production**

```bash
npm run build
```

### **Environment Variables**

```env
VITE_BACKEND_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=Document Scan
VITE_APP_VERSION=1.0.0
```

### **Deployment Platforms**

- ✅ **Vercel** (Recommended)
- ✅ **Netlify**
- ✅ **AWS S3 + CloudFront**
- ✅ **Azure Static Web Apps**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@documentscan.com
- 💬 Discord: [Document Scan Community](https://discord.gg/documentscan)
- 🐛 Issues: [GitHub Issues](https://github.com/username/document-scan/issues)

---

**Built with ❤️ using React, TypeScript, and Vite**
