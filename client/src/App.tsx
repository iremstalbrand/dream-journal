import { Routes, Route } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { setTokenGetter } from "./api";
import Dreams from "./pages/Dreams";
import NewDream from "./pages/NewDream";
import DreamDetail from "./pages/DreamDetail";
import Timeline from "./pages/Timeline";

export default function App() {
  const { getToken } = useAuth();
  setTokenGetter(getToken);

  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <SignIn />
        </div>
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
        </Routes>
      </SignedIn>
    </>
  );
}
