export interface CVPersonal {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  location?: string;
}

export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  details?: string;
}

export interface CVLanguage {
  id: string;
  name: string;
  level: string; // e.g., Native, Fluent, Good, Expert
}

export interface CVProject {
  id: string;
  title: string;
  description: string;
  technologies?: string;
}

export interface CVData {
  personal: CVPersonal;
  experience: CVExperience[];
  education: CVEducation[];
  projects: CVProject[];
  languages: CVLanguage[];
  skills: string[];
  selectedTemplate: 'classic' | 'modern' | 'academic';
  targetJobDescription?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  description: string;
  source: string; // e.g., JobsGates, Bayt, LinkedIn
  salary?: string;
  url?: string;
  createdAt: number; // timestamp
}

export interface AgencyReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Agency {
  id: string;
  name: string;
  phone: string;
  address: string;
  description: string;
  image?: string;
  rating: number; // average stars
  reviews: AgencyReview[];
  userAdded?: boolean;
  facebook?: string;
  telegram?: string;
  website?: string;
  trustedByOwner?: boolean;
}

export interface InfluencerPost {
  id: string;
  name: string;
  handle: string;
  platform: 'LinkedIn' | 'Twitter' | 'Telegram';
  content: string;
  timeLabel: string;
  avatarColor: string;
}
