import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import Nutrition from "@/pages/Nutrition";
import Coach from "@/pages/Coach";
import Progress from "@/pages/Progress";
import Onboarding from "@/pages/Onboarding";
import Calendar from "@/pages/Calendar";
import Shopping from "@/pages/Shopping";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import AuthGate from "@/components/AuthGate";

function Protected({ children }) {
  return <AuthGate>{children}</AuthGate>;
}

export default function App() {
  return <Routes>
    <Route path="/register" element={<Auth />} />
    <Route path="/login" element={<Auth />} />
    <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
    <Route path="/profile" element={<Protected><Profile /></Protected>} />
    <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
    <Route path="/train" element={<Protected><Workouts /></Protected>} />
    <Route path="/fuel" element={<Protected><Nutrition /></Protected>} />
    <Route path="/shopping" element={<Protected><Shopping /></Protected>} />
    <Route path="/coach" element={<Protected><Coach /></Protected>} />
    <Route path="/stats" element={<Protected><Progress /></Protected>} />
    <Route path="/" element={<Protected><Dashboard /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
