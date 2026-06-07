# Lender Connect - Smart Loan Assessment Platform

This project is an AI-powered loan assessment platform for banks to evaluate small business creditworthiness based on CIBIL scores, transaction history, and existing loans.

## Technologies Used

- React (Vite)
- TypeScript
- Tailwind CSS & shadcn-ui
- Firebase (Auth & Firestore)
- Machine Learning (Logistic Regression for approval probabilities)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   Create a `.env` file based on `.env.example` and add your Firebase configuration credentials. Ensure you have enabled Email/Password authentication and Firestore database in your Firebase project.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Key Features

- **Loan Assessment Form**: Input applicant data to instantly generate risk assessments using an embedded ML model.
- **Admin Dashboard**: View recent applications and their calculated risk levels.
- **Analytics**: Visualize loan distribution, CIBIL scores, and approval rates.
