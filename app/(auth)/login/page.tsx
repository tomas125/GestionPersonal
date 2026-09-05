import { Wallet } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-header">
            <Wallet className="h-6 w-6 text-accent-green" />
          </div>
          <h1 className="text-xl font-semibold">Finanzas Personales</h1>
          <p className="text-sm text-muted">Tu asistente financiero</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
