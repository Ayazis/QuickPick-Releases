const preferredAssetExtensions = ['.exe', '.msixbundle', '.msi', '.zip', '.7z'];
const channelLabels = {
  prerelease: '-alpha'
};

function findRelease(channel, releases) {
  return releases.find((release) => {
    if (release.draft) {
      return false;
    }

    return channel === 'prerelease' ? release.prerelease : !release.prerelease;
  });
}

function pickAsset(release) {
  if (!release || !Array.isArray(release.assets) || release.assets.length === 0) {
    return null;
  }

  for (const extension of preferredAssetExtensions) {
    const match = release.assets.find((asset) => asset.name.toLowerCase().endsWith(extension));
    if (match) {
      return match;
    }
  }

  return release.assets[0];
}

function formatVersion(release) {
  return release.name || release.tag_name || 'Unknown version';
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Publish date unavailable';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Publish date unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function setLinkState(link, { href, label, disabled }) {
  link.textContent = label;
  link.setAttribute('aria-disabled', disabled ? 'true' : 'false');

  if (disabled) {
    link.removeAttribute('href');
    return;
  }

  link.href = href;
}

function updateCard(channel, release) {
  const card = document.querySelector(`[data-channel="${channel}"]`);
  if (!card) {
    return;
  }

  const version = card.querySelector('[data-field="version"]');
  const published = card.querySelector('[data-field="published"]');
  const status = card.querySelector('[data-field="status"]');
  const downloadLink = card.querySelector('[data-field="download-link"]');

  if (!release) {
    version.textContent = 'Unavailable';
    published.textContent = `No ${channelLabels[channel] || channel} release found.`;
    status.textContent = 'Nothing to download yet for this channel.';
    setLinkState(downloadLink, { label: 'No download available', disabled: true });
    return;
  }

  const asset = pickAsset(release);
  version.textContent = formatVersion(release);
  published.textContent = `Published ${formatDate(release.published_at)}`;
  status.textContent = asset
    ? `Latest asset: ${asset.name}`
    : 'No release asset was attached, but the release notes are available.';

  setLinkState(downloadLink, {
    href: asset ? asset.browser_download_url : release.html_url,
    label: asset ? 'Download now' : 'Open release notes',
    disabled: false
  });
}

function setErrorState(message) {
  for (const channel of ['prerelease']) {
    const card = document.querySelector(`[data-channel="${channel}"]`);
    if (!card) {
      continue;
    }

    card.querySelector('[data-field="version"]').textContent = 'Unavailable';
    card.querySelector('[data-field="published"]').textContent = 'Could not load release data.';
    const status = card.querySelector('[data-field="status"]');
    status.textContent = message;
    status.classList.add('download-error');

    setLinkState(card.querySelector('[data-field="download-link"]'), {
      label: 'Retry later',
      disabled: true
    });
  }
}

async function loadReleases() {
  try {
    const releases = await window.QuickPickReleases.fetchReleases();
    updateCard('prerelease', findRelease('prerelease', releases));
  } catch (error) {
    setErrorState('GitHub release data is temporarily unavailable.');
    console.error('Failed to load QuickPick releases.', error);
  }
}

loadReleases();