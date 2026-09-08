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

export default function App() {
  return <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/train" element={<Workouts />} />
    <Route path="/fuel" element={<Nutrition />} />
    <Route path="/shopping" element={<Shopping />} />
    <Route path="/coach" element={<Coach />} />
    <Route path="/stats" element={<Progress />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
