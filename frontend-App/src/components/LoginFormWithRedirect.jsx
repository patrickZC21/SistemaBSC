import React from "react";
import LoginForm from "../components/LoginForm";
import { useLoginRedirect } from "../hooks/useLoginRedirect";

export default function LoginFormWithRedirect() {
  const handleLogin = useLoginRedirect();
  return <LoginForm onLogin={handleLogin} />;
}
