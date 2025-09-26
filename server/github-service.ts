import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  tags: string[];
  downloadUrl: string;
  createdAt: string;
  author: string;
}

export class GitHubBudgetService {
  /**
   * Search for budget management templates and tools in GitHub
   */
  static async searchBudgetTemplates(query: string = 'budget management template', limit: number = 20): Promise<BudgetTemplate[]> {
    try {
      const github = await getUncachableGitHubClient();
      
      const searchQuery = `${query} language:javascript OR language:typescript OR language:python in:name,description,readme`;
      
      const response = await github.rest.search.repos({
        q: searchQuery,
        sort: 'stars',
        order: 'desc',
        per_page: limit
      });

      return response.data.items.map(repo => ({
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || 'No description available',
        category: this.categorizeRepository(repo.name, repo.description || ''),
        language: repo.language || 'Unknown',
        tags: repo.topics || [],
        downloadUrl: repo.clone_url,
        createdAt: repo.created_at,
        author: repo.owner?.login || 'Unknown'
      }));
    } catch (error) {
      console.error('GitHub API Error:', error);
      return [];
    }
  }

  /**
   * Get featured budget management repositories
   */
  static async getFeaturedBudgetRepos(): Promise<BudgetTemplate[]> {
    const featuredQueries = [
      'personal finance app',
      'budget tracker javascript',
      'expense manager react',
      'financial planning tool',
      'money management app'
    ];

    try {
      const allResults: BudgetTemplate[] = [];
      
      for (const query of featuredQueries) {
        const results = await this.searchBudgetTemplates(query, 5);
        allResults.push(...results);
      }

      // Remove duplicates and return top 20
      const uniqueResults = allResults.filter((repo, index, self) => 
        index === self.findIndex(r => r.id === repo.id)
      );

      return uniqueResults.slice(0, 20);
    } catch (error) {
      console.error('Error fetching featured repos:', error);
      return [];
    }
  }

  /**
   * Get repository details including README content
   */
  static async getRepositoryDetails(owner: string, repo: string) {
    try {
      const github = await getUncachableGitHubClient();
      
      const [repoDetails, readmeContent] = await Promise.all([
        github.rest.repos.get({ owner, repo }),
        github.rest.repos.getReadme({ owner, repo }).catch(() => null)
      ]);

      let readmeText = '';
      if (readmeContent) {
        const content = Buffer.from(readmeContent.data.content, 'base64').toString('utf-8');
        readmeText = content;
      }

      return {
        ...repoDetails.data,
        readmeContent: readmeText
      };
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw error;
    }
  }

  /**
   * Fork a repository to user's account
   */
  static async forkRepository(owner: string, repo: string) {
    try {
      const github = await getUncachableGitHubClient();
      
      const response = await github.rest.repos.createFork({
        owner,
        repo
      });

      return response.data;
    } catch (error) {
      console.error('Error forking repository:', error);
      throw error;
    }
  }

  /**
   * Get user's GitHub profile information
   */
  static async getUserProfile() {
    try {
      const github = await getUncachableGitHubClient();
      const response = await github.rest.users.getAuthenticated();
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Categorize repository based on name and description
   */
  private static categorizeRepository(name: string, description: string): string {
    const text = `${name} ${description}`.toLowerCase();
    
    if (text.includes('personal') || text.includes('individual')) {
      return 'Personal Finance';
    } else if (text.includes('business') || text.includes('enterprise')) {
      return 'Business Finance';
    } else if (text.includes('budget') || text.includes('expense')) {
      return 'Budget Management';
    } else if (text.includes('investment') || text.includes('portfolio')) {
      return 'Investment Tracking';
    } else if (text.includes('mobile') || text.includes('app')) {
      return 'Mobile Application';
    } else if (text.includes('web') || text.includes('dashboard')) {
      return 'Web Application';
    } else {
      return 'General Finance';
    }
  }
}