import { SignIn } from "@clerk/clerk-react";
import AuthLayout, { authAppearance } from "../components/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back, dreamer"
      subtitle="Sign in to return to your nights."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        appearance={authAppearance}
      />
    </AuthLayout>
  );
}
