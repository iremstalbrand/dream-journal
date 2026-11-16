import { Routes, Route, Navigate } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { setTokenGetter } from "./api";
import Dreams from "./pages/Dreams";
import NewDream from "./pages/NewDream";
import DreamDetail from "./pages/DreamDetail";
import Timeline from "./pages/Timeline";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

export default function App() {
  const { getToken } = useAuth();
  setTokenGetter(getToken);

  return (
    <>
      <SignedOut>
        <Routes>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </SignedOut>

      <SignedIn>
        <div className="fixed top-4 right-4 z-50">
          <UserButton />
        </div>
        <Routes>
          <Route path="/" element={<NewDream />} />
          <Route path="/dreams" element={<Dreams />} />
          <Route path="/dream/:id" element={<DreamDetail />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/sign-in/*" element={<Navigate to="/" replace />} />
          <Route path="/sign-up/*" element={<Navigate to="/" replace />} />
        </Routes>
      </SignedIn>
    </>
  );
}
