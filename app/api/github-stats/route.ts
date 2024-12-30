import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchRepoStats(repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 86400 } // Revalidate every 24 hours
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count
    };
  } catch (error) {
    console.error(`Error fetching stats for ${repo}:`, error);
    return null;
  }
}

export async function GET() {
  const repos = [
    'Replete-AI/Interactive-Experience-Generator',
    'RepleteAI/text-processor'
  ];

  try {
    const stats = await Promise.all(
      repos.map(async (repo) => {
        const repoStats = await fetchRepoStats(repo);
        return {
          repo,
          ...repoStats
        };
      })
    );

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    );
  }
}