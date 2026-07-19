import { apiClient } from '../api/client';

export type SearchScope = 'STUDENTS' | 'COHORTS' | 'ASSESSMENTS' | 'QUESTIONS' | 'RESOURCES' | 'REPORTS';

export interface SearchResultItem {
  id: string;
  scope: SearchScope;
  title: string;
  description: string;
  url: string;
}

export const globalSearchService = {
  async search(query: string, scopes: SearchScope[] = []): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];
    try {
      const scopeParams = scopes.map(s => `scope=${s}`).join('&');
      return await apiClient.get<SearchResultItem[]>(`/api/v1/search?query=${query}&${scopeParams}`);
    } catch (e) {
      // Mock search fallbacks
      const allMockResults: SearchResultItem[] = [
        { id: '1', scope: 'STUDENTS', title: 'John Doe', description: 'Student portfolio (Ready score: 82%)', url: '/instructor/students/s1' },
        { id: '2', scope: 'STUDENTS', title: 'Jane Smith', description: 'Student portfolio (Ready score: 58%, High Risk)', url: '/instructor/students/s2' },
        { id: '3', scope: 'COHORTS', title: 'English Class A', description: 'Class roster overview (25 students)', url: '/instructor/cohorts/c1' },
        { id: '4', scope: 'ASSESSMENTS', title: 'English Mock Exam Module A', description: 'Mock exam diagnostic scheduler', url: '/instructor/assessments/a1' },
        { id: '5', scope: 'RESOURCES', title: 'Grammar Modifiers Cheat Sheet', description: 'PDF worksheet lessons resources', url: '/instructor/resources' }
      ];

      return allMockResults.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                             item.description.toLowerCase().includes(query.toLowerCase());
        const matchesScope = scopes.length === 0 || scopes.includes(item.scope);
        return matchesQuery && matchesScope;
      });
    }
  }
};
export default globalSearchService;
