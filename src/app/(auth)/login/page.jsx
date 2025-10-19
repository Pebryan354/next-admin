"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setAuth, getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) router.replace("/dashboard");
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorValidation, setErrorValidation] = useState({});
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidation({});
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      addToast("Login berhasil!", "", "success");

      setAuth(response.data.token, response.data.user);
      router.push("/dashboard");
    } catch (err) {
      let res = err.response?.data;
      if (res?.error == "validation") {
        addToast("Login gagal!", res?.message || "Terjadi kesalahan", "error");
        setErrorValidation(res.data);
      } else {
        addToast("Login gagal!", res?.message || "Terjadi kesalahan", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="p-6 w-[360px]">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <small className="text-xs text-red-500">
              {errorValidation.email}
            </small>
          </div>
          <div>
            <Label className="mb-2">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small className="text-xs text-red-500">
              {errorValidation.password}
            </small>
          </div>
          <Button
            type="submit"
            className="hover:bg-primary/90 hover:cursor-pointer"
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
