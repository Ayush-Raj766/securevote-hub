import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { contractService, Election, Candidate } from "@/services/contractService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const candidateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  party: z.string().min(2, "Party is required"),
  imageUrl: z.string().optional(),
  walletAddress: z.string().min(10, "Wallet address is required"),
});

type CandidateForm = z.infer<typeof candidateSchema>;

export default function SubadminCandidates() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
  });

  useEffect(() => {
    contractService.getElections().then(setElections);
  }, []);

  const onAdd = async (data: CandidateForm) => {
    if (!selectedElection) {
      toast({ title: "Select an election first", variant: "destructive" });
      return;
    }
    try {
      await contractService.addCandidate(selectedElection, {
        name: data.name,
        party: data.party,
        imageUrl: data.imageUrl || "",
        walletAddress: data.walletAddress,
      });
      const updated = await contractService.getElections();
      setElections(updated);
      toast({ title: "Candidate added!" });
      setOpen(false);
      reset();
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    }
  };

  const currentElection = elections.find((e) => e.id === selectedElection);

  return (
    <DashboardLayout role="subadmin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Candidates</h1>
          <p className="text-muted-foreground">Add candidates to elections</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="glow-primary"><PlusCircle className="mr-2 h-4 w-4" />Add Candidate</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input {...register("name")} className="mt-1 bg-secondary/50" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Party</Label>
                <Input {...register("party")} className="mt-1 bg-secondary/50" />
                {errors.party && <p className="mt-1 text-xs text-destructive">{errors.party.message}</p>}
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input {...register("imageUrl")} className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label>Wallet Address</Label>
                <Input {...register("walletAddress")} className="mt-1 bg-secondary/50" placeholder="0x..." />
                {errors.walletAddress && <p className="mt-1 text-xs text-destructive">{errors.walletAddress.message}</p>}
              </div>
              <Button type="submit" className="w-full">Add Candidate</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Election selector */}
      <div className="mb-6">
        <Label>Select Election</Label>
        <Select value={selectedElection} onValueChange={setSelectedElection}>
          <SelectTrigger className="mt-1 w-full max-w-sm bg-secondary/50">
            <SelectValue placeholder="Choose an election" />
          </SelectTrigger>
          <SelectContent>
            {elections.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Candidates list */}
      {currentElection && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentElection.candidates.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.party}</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{c.walletAddress}</p>
            </div>
          ))}
          {currentElection.candidates.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">No candidates yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
