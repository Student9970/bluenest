import { Suspense } from "react";
import { LoginFlow, LoginFlowFallback } from "@/components/LoginFlow";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFlowFallback />}>
      <LoginFlow />
    </Suspense>
  );
}
