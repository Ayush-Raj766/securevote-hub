/**
 * Smart Contract Interaction Service
 * Uses ethers.js to interact with the voting smart contract on Sepolia.
 * 
 * Contract address should be set via VITE_CONTRACT_ADDRESS env variable.
 * ABI is defined below — update it to match your deployed contract.
 */

import { BrowserProvider, Contract, formatUnits } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Minimal ABI — expand to match your actual contract
const CONTRACT_ABI = [
  "function createElection(string title, string description, uint256 startTime, uint256 endTime) external",
  "function addCandidate(uint256 electionId, string name, string party, string imageUrl, address wallet) external",
  "function vote(uint256 electionId, uint256 candidateId) external",
  "function getElection(uint256 electionId) external view returns (string title, string description, uint256 startTime, uint256 endTime, bool active)",
  "function getCandidateVotes(uint256 electionId, uint256 candidateId) external view returns (uint256)",
  "function getWinner(uint256 electionId) external view returns (uint256 candidateId, string name, uint256 votes)",
  "function hasVoted(uint256 electionId, address voter) external view returns (bool)",
  "function startElection(uint256 electionId) external",
  "function endElection(uint256 electionId) external",
];

function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new BrowserProvider(window.ethereum);
}

async function getContract(withSigner = false) {
  const provider = getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// --- Mock implementations for demo (replace with real contract calls) ---

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "ended";
  candidates: Candidate[];
  totalVotes: number;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  imageUrl: string;
  walletAddress: string;
  votes: number;
}

// In-memory mock data
let mockElections: Election[] = [
  {
    id: "1",
    title: "2024 Student Council Election",
    description: "Annual student council president election for the academic year 2024-2025.",
    startDate: "2024-12-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    totalVotes: 342,
    candidates: [
      { id: "c1", name: "Alice Johnson", party: "Progress Party", imageUrl: "", walletAddress: "0xaaa...111", votes: 156 },
      { id: "c2", name: "Bob Smith", party: "Unity Alliance", imageUrl: "", walletAddress: "0xbbb...222", votes: 120 },
      { id: "c3", name: "Carol Williams", party: "Innovation Front", imageUrl: "", walletAddress: "0xccc...333", votes: 66 },
    ],
  },
  {
    id: "2",
    title: "Community Budget Allocation",
    description: "Vote on how the community fund should be allocated for the next quarter.",
    startDate: "2025-01-15T00:00:00Z",
    endDate: "2025-02-15T23:59:59Z",
    status: "upcoming",
    totalVotes: 0,
    candidates: [
      { id: "c4", name: "Plan A: Infrastructure", party: "Development", imageUrl: "", walletAddress: "0xddd...444", votes: 0 },
      { id: "c5", name: "Plan B: Education", party: "Education", imageUrl: "", walletAddress: "0xeee...555", votes: 0 },
    ],
  },
];

const votedMap = new Map<string, Set<string>>(); // electionId -> Set<walletAddress>

export const contractService = {
  async getElections(): Promise<Election[]> {
    await new Promise((r) => setTimeout(r, 300));
    return mockElections;
  },

  async getElection(id: string): Promise<Election | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return mockElections.find((e) => e.id === id);
  },

  async createElection(data: { title: string; description: string; startDate: string; endDate: string }): Promise<Election> {
    await new Promise((r) => setTimeout(r, 1000));
    const election: Election = {
      id: String(mockElections.length + 1),
      ...data,
      status: "upcoming",
      candidates: [],
      totalVotes: 0,
    };
    mockElections.push(election);
    return election;
  },

  async addCandidate(electionId: string, candidate: Omit<Candidate, "id" | "votes">): Promise<Candidate> {
    await new Promise((r) => setTimeout(r, 800));
    const election = mockElections.find((e) => e.id === electionId);
    if (!election) throw new Error("Election not found");
    const newCandidate: Candidate = {
      id: `c${Date.now()}`,
      ...candidate,
      votes: 0,
    };
    election.candidates.push(newCandidate);
    return newCandidate;
  },

  async vote(electionId: string, candidateId: string, walletAddress: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 1500));
    const election = mockElections.find((e) => e.id === electionId);
    if (!election) throw new Error("Election not found");
    if (election.status !== "active") throw new Error("Election is not active");
    
    if (!votedMap.has(electionId)) votedMap.set(electionId, new Set());
    const voters = votedMap.get(electionId)!;
    if (voters.has(walletAddress)) throw new Error("You have already voted in this election");
    
    const candidate = election.candidates.find((c) => c.id === candidateId);
    if (!candidate) throw new Error("Candidate not found");
    
    candidate.votes += 1;
    election.totalVotes += 1;
    voters.add(walletAddress);
    
    return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
  },

  async hasVoted(electionId: string, walletAddress: string): Promise<boolean> {
    return votedMap.get(electionId)?.has(walletAddress) ?? false;
  },

  async startElection(electionId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 1000));
    const election = mockElections.find((e) => e.id === electionId);
    if (election) election.status = "active";
  },

  async endElection(electionId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 1000));
    const election = mockElections.find((e) => e.id === electionId);
    if (election) election.status = "ended";
  },

  async getWinner(electionId: string): Promise<Candidate | null> {
    const election = mockElections.find((e) => e.id === electionId);
    if (!election || election.candidates.length === 0) return null;
    return election.candidates.reduce((max, c) => (c.votes > max.votes ? c : max), election.candidates[0]);
  },
};
