export interface VoiceOption {
  id: string;
  name: string;
  tone: string;
  description: string;
}

export interface AudioGenerationResult {
  audioDataUrl: string;
  voice: string;
  durationEstimateSeconds: number;
  generatedAt: number;
  text: string;
}

export interface ParagraphSegment {
  id: number;
  text: string;
}
