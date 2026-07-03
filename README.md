# Lender Connect - Smart Loan Assessment Platform

Lender Connect is an end-to-end, AI-powered credit risk assessment platform that evaluates loan applications using real-world credit risk models trained on historic bank applicant profiles.

---

## 📁 Project Structure

This project uses a clean separation between the frontend client and the machine learning backend:

- **`/frontend`**: React/Vite web application, Tailwind CSS, shadcn-ui, and Firebase client integration.
- **`/backend`**: Python/FastAPI ML API and Random Forest model training pipeline.

---

## 🚀 Getting Started

### 1. Backend Setup & Model Training
Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment and install the dependencies:
```bash
python -m venv venv
venv\Scripts\activate      # On Windows
source venv/bin/activate   # On macOS/Linux

pip install -r requirements.txt
```

Train the machine learning model (downloads the real UCI Statlog German Credit dataset, runs comparative models, and saves the best model):
```bash
python train.py
```

Run the FastAPI backend server:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
*The API is now running at http://localhost:8000.*

---

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Set up your Firebase credentials:
Create a `.env` file inside the `frontend/` directory (use `.env.example` as a template) and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=lender-connect
...
```

Start the React development server:
```bash
npm run dev
```
*The web interface is now running at http://localhost:8080 (or http://localhost:5173).*

---

## 🤖 Machine Learning Model
The underlying AI is trained on the **UCI Statlog (German Credit Data)** dataset (1,000 real historical bank applicant records with 20 categorical and numeric features). 
- **Model used**: Random Forest Classifier
- **Metrics**: ~70% Validation Accuracy, 0.79 ROC-AUC
- Evaluates credit history, savings level, loan term/amount, employment stability, and demographic context to calculate approval probability and risk scores.

---

## 🔒 Security & Database
- **Firestore Database**: All loan application evaluations are stored securely in a custom Firestore database.
- **Security Rules**: Write-only for anonymous applicants (to prevent unauthorized reading or scraping) and read/write for verified administrators.
- **Admin Dashboard**: Accessible by logging in with the authorized admin email address.
