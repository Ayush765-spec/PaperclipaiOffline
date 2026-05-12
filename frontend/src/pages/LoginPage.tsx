import { useState } from "react";
import { authApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { Button } from "../components/ui/Button.js";
import { Input, FormGroup } from "../components/ui/Modal.js";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail]       = useState("admin@acme.com");
  const [password, setPassword] = useState("password123");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authApi.login(email, password);
      login(data.token, data.userId, data.companyId);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ width: 360 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          <div style={{
            width: 34, height: 34, background: "var(--accent)",
            borderRadius: 8, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white",
          }}>
            P
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: -0.3 }}>Paperclip</span>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 18 }}>Sign in</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormGroup label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </FormGroup>

            <FormGroup label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormGroup>

            {error && (
              <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>
            )}

            <Button variant="primary" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: "center" }}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}