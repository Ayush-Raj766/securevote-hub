import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const subadminSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  walletAddress: z.string().min(10, "Wallet address is required"),
});

type SubadminForm = z.infer<typeof subadminSchema>;

interface SubAdmin {
  id: string;
  fullName: string;
  email: string;
  walletAddress: string;
  createdAt: string;
  isActive: boolean;
}

const initialSubadmins: SubAdmin[] = [
  {
    id: "sa-1",
    fullName: "Sub Admin User",
    email: "subadmin@blockvote.io",
    walletAddress: "0x5678...9012",
    createdAt: "2025-01-10",
    isActive: true,
  },
];

export default function AdminSubadmins() {
  const [subadmins, setSubadmins] = useState<SubAdmin[]>(initialSubadmins);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubadminForm>({
    resolver: zodResolver(subadminSchema),
  });

  const onCreate = (data: SubadminForm) => {
    const newSub: SubAdmin = {
      id: `sa-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      walletAddress: data.walletAddress,
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true,
    };
    setSubadmins((prev) => [...prev, newSub]);
    toast({ title: "Sub-Admin created successfully!" });
    setOpen(false);
    reset();
  };

  const toggleActive = (id: string) => {
    setSubadmins((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    toast({ title: "Sub-Admin status updated" });
  };

  const removeSub = (id: string) => {
    setSubadmins((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Sub-Admin removed" });
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sub-Admins</h1>
          <p className="text-muted-foreground">
            Manage sub-admins who can verify voters and add candidates
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="glow-primary">
              <PlusCircle className="mr-2 h-4 w-4" />Add Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle>Create Sub-Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input {...register("fullName")} className="mt-1 bg-secondary/50" />
                {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input {...register("email")} type="email" className="mt-1 bg-secondary/50" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Wallet Address</Label>
                <Input {...register("walletAddress")} className="mt-1 bg-secondary/50" placeholder="0x..." />
                {errors.walletAddress && <p className="mt-1 text-xs text-destructive">{errors.walletAddress.message}</p>}
              </div>
              <Button type="submit" className="w-full">Create Sub-Admin</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Permissions info */}
      <div className="glass-card mb-6 p-4">
        <h3 className="mb-2 text-sm font-semibold text-primary">Sub-Admin Permissions</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Verify and approve/reject voter registrations</li>
          <li>• Add candidates to elections</li>
          <li>• View transparency dashboard</li>
          <li className="text-destructive/80">• Cannot create/start/end elections or manage other sub-admins</li>
        </ul>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subadmins.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{s.email}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.walletAddress}</TableCell>
                <TableCell className="text-muted-foreground">{s.createdAt}</TableCell>
                <TableCell>
                  <Badge className={s.isActive ? "bg-green-500/20 text-green-400" : "bg-destructive/20 text-destructive"}>
                    {s.isActive ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(s.id)} className="h-7">
                      <UserCheck className="mr-1 h-3 w-3" />{s.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeSub(s.id)} className="h-7 border-destructive/30 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subadmins.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No sub-admins yet. Create one to delegate voter verification.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
