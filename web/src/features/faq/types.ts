export type FaqSummary = {
  id: number;
  category: string | null;
  question: string;
  updatedAt: string;
};

export type FaqDetail = FaqSummary & {
  answer: string;
};
