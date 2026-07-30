import apiClient from '@/lib/apiClient';

export interface SearchResult {
  file_id: string;
  file_name: string;
  score: number;
  snippet: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aiApi = {
  semanticSearch: (query: string, topK = 5) =>
    apiClient.post('/ai/search', { query, topK }),
    
  getFileSummary: (fileId: string) =>
    apiClient.post('/ai/summarize', { fileId }),
    
  chat: (messages: ChatMessage[], folderId?: string | null, fileId?: string | null) =>
    apiClient.post('/ai/chat', { messages, folderId, fileId }),
};
