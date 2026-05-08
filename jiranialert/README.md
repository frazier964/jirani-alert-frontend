# Jirani Alert - Emergency Community Response Platform

A comprehensive community emergency notification and coordination system.

## 📁 Project Structure

This project is organized into two main directories:

### Frontend (`/frontend`)
- React-based web application
- Built with Vite
- Styled with Tailwind CSS
- Features include:
  - Emergency reporting interface
  - Real-time alerts dashboard
  - Community coordination features
  - Live incident tracking

**Key files:**
- `package.json` - Frontend dependencies
- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `src/` - React source code
- `public/` - Static assets
- `dist/` - Production build output

### Backend (`/backend`)
- Firebase Cloud Functions
- Firestore database configuration
- Real-time database rules
- Emergency data processing

**Key files:**
- `firebase.json` - Firebase configuration
- `firestore.rules` - Database access rules
- `firestore.indexes.json` - Firestore indexes
- `functions/` - Cloud function implementations
- `package.json` - Backend dependencies

## 🚀 Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Development server
npm run build    # Production build
```

### Backend Setup
```bash
cd backend
npm install
npm run emulator # Run Firebase emulator locally
```

## 📦 Dependencies

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Firebase, Cloud Functions

## 🔧 Configuration

- Root `.gitignore` - Global git ignore rules
- `.vscode/` - VS Code workspace settings

## 📝 License

[Add your license here]

---

**Ready to push to GitHub!** Both frontend and backend are properly organized and ready for deployment.
