import "./App.css";
import AppLayout from "./components/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MissionControl from "./pages/mission-control/index";
import UserList from "./pages/users";
import testUI from "./pages/TestUI";
import CarsMgmt from "./pages/cars";
import Login from "./auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./auth/AuthProvider";
import Index from "./pages/create-routes";
import RouterGenerator from "./pages/map-tracking/MapTracking";
import Profile from "./pages/user-profile/profile";
import { MapIcon } from "lucide-react";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MissionControl />} />
            <Route path="/map-tracking" element={<RouterGenerator />} />
            <Route path="/routes" element={<Index />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/cars" element={<CarsMgmt />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/testUI" element={<testUI />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
