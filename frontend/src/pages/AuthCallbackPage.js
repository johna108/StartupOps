import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }

        setStatus("Finalizing login...");

        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(window.location.href);

        if (exchangeError) {
          console.error("[AuthCallback] Exchange error:", exchangeError);
          setError(exchangeError.message);
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }

        if (!data?.session) {
          throw new Error("Session not created");
        }

        // ✅ Success
        navigate("/dashboard");
      } catch (err) {
        console.error("[AuthCallback] Fatal error:", err);
        setError("Authentication failed. Redirecting...");
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-destructive text-lg">{error}</p>
            <p className="text-muted-foreground text-sm">
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
