export interface Idea {
  id: string;
  timestamp: string;
  createdAt?: string;
  rowNumber?: number;
  name: string;
  department: string;
  title: string;
  problem: string;
  description?: string;
  category: string;
  like: number;
  likes?: number;
  cheer?: number;
  displayName?: boolean;
  
  // UI-specific properties that can be calculated
  isNew?: boolean;
}

// For compatibility with any remaining references
export type AgentIdea = Idea;
