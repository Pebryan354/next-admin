"use client";

import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card className="p-4 shadow-sm rounded-sm">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p className="text-gray-500 mt-1">Selamat datang di dashboard admin.</p>
    </Card>
  );
}
