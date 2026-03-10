import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { contractService, Election } from "@/services/contractService";
import { Users, UserCheck, Vote } from "lucide-react";
import { motion } from "framer-motion";

export default function SubadminDashboard() {
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    contractService.getElections().then(setElections);
  }, []);

  const stats = [
    { label: "Active Elections", value: elections.filter((e) => e.status === "active").length, icon: Vote, color: "text-primary" },
    { label: "Total Candidates", value: elections.reduce((s, e) => s + e.candidates.length, 0), icon: Users, color: "text-accent" },
    { label: "Pending Voters", value: 2, icon: UserCheck, color: "hsl(var(--warning))" },
  ];

  return (
    <DashboardLayout role="subadmin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sub-Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Verify voters and manage candidates</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="glass-card-hover p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-3xl font-bold">{s.value}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 glass-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Your Responsibilities</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" /> Review and approve voter registrations</li>
          <li className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> Add candidates to elections created by admin</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
