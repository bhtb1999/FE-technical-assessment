export type ChatEntry = {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatEntry[];
};

export type GenerateResponse = {
  error?: string;
  text?: string;
};

export type LiveResponse = {
  prompt: string;
  response: string;
};
