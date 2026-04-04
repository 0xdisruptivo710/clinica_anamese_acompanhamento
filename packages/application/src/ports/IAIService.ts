export interface PostSessionAIInput {
  clientName: string;
  clientAge?: number;
  sessionNumber: number;
  sessionDate: string;
  proceduresList: string[];
  treatmentAreas: string[];
  professionalName: string;
  totalPreviousSessions: number;
  previousProcedures: string[];
  aestheticGoal?: string;
  followUpDate?: string;
}

export interface PostSessionAIOutput {
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
  postCareTips: string[];
  expectedResultsTimeline: string;
  motivationalNote: string;
}

export interface IAIService {
  generatePostSessionMessage(input: PostSessionAIInput): Promise<PostSessionAIOutput>;
  estimateCost(inputTokens: number, outputTokens: number): number;
}
