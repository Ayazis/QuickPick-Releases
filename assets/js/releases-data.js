const RELEASES_API_URL = 'https://api.github.com/repos/Ayazis/QuickPick-Releases/releases?per_page=20';
const RELEASES_CACHE_KEY = 'quickpick-releases-cache';
const RELEASES_CACHE_TTL_MS = 5 * 60 * 1000;

function readReleasesCache() {
  try {
    const raw = sessionStorage.getItem(RELEASES_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw);
    if (!cached || Date.now() - cached.timestamp > RELEASES_CACHE_TTL_MS) {
      return null;
    }

    return cached.releases;
  } catch (error) {
    return null;
  }
}

function writeReleasesCache(releases) {
  try {
    sessionStorage.setItem(RELEASES_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), releases }));
  } catch (error) {
    // Ignore storage failures (e.g. private browsing quota).
  }
}

async function fetchReleases() {
  const cached = readReleasesCache();
  if (cached) {
    return cached;
  }

  const response = await fetch(RELEASES_API_URL, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}`);
  }

  const releases = await response.json();
  writeReleasesCache(releases);
  return releases;
}

window.QuickPickReleases = { fetchReleases };
