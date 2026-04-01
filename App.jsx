// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import LandingPage from "./components/LandingPage/LandingPage";
import HomePage from "./components/HomePage/HomePage";
import AnalysisPage from "./components/AnalysisPage/AnalysisPage";
import ResultsPage from "./components/ResultPage/ResultsPage";
import LoginPage from "./components/LoginPage/LoginPage";
import SignupPage from "./components/SignUp/SignUpPage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import CrossPlatformResults from "./components/CrossPlatform/CrossPlatformResults";


const App = () => {
  const [jobText, setJobText] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [user, setUser] = useState(null);

  // Example stats
  const trainingStats = {
    totalSamples: 17880,
    realJobs: 16570,
    fakeJobs: 1310,
    accuracy: 94.2,
  };

  const distributionData = [
    { name: "Real Jobs", value: trainingStats.realJobs, color: "#22c55e" },
    { name: "Fake Jobs", value: trainingStats.fakeJobs, color: "#ef4444" },
  ];

  const modelMetrics = [
    { metric: "Accuracy", value: 94.2 },
    { metric: "Precision", value: 91.8 },
    { metric: "Recall", value: 89.5 },
    { metric: "F1-Score", value: 90.6 },
  ];

  const featureImportance = [
    { feature: "Company Profile", importance: 0.23 },
    { feature: "Job Description", importance: 0.19 },
    { feature: "Requirements", importance: 0.16 },
  ];

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={
            <HomePage
              trainingStats={trainingStats}
              distributionData={distributionData}
              modelMetrics={modelMetrics}
              featureImportance={featureImportance}
            />
          }
        />
        <Route
          path="/analyze"
          element={
            <AnalysisPage
              user={user}
              jobText={jobText}
              setJobText={setJobText}
              prediction={prediction}
              setPrediction={setPrediction}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ResultsPage
              prediction={prediction}
              jobText={jobText}
              setPrediction={setPrediction}
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
<Route
  path="/cross-platform"
  element={<CrossPlatformResults />}
/>

      </Routes>
    </Router>
  );
};

export default App;
