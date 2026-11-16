import { SignUp } from "@clerk/clerk-react";
import AuthLayout, { authAppearance } from "../components/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Begin your dream journal"
      subtitle="Create an account to keep your nights."
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
        appearance={authAppearance}
      />
    </AuthLayout>
  );
}
