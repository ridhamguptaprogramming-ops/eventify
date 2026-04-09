export function getNetlifyProductionHostname(hostname: string): string | null {
  const normalized = hostname.trim().toLowerCase();
  const netlifySuffix = ".netlify.app";

  if (!normalized.endsWith(netlifySuffix)) {
    return null;
  }

  const withoutSuffix = normalized.slice(0, -netlifySuffix.length);
  const previewSeparatorIndex = withoutSuffix.indexOf("--");

  if (previewSeparatorIndex === -1) {
    return null;
  }

  const candidate = withoutSuffix.slice(previewSeparatorIndex + 2).trim();
  if (!candidate) {
    return null;
  }

  return `${candidate}${netlifySuffix}`;
}

export function isNetlifyDeployPreviewHostname(hostname: string): boolean {
  return getNetlifyProductionHostname(hostname) !== null;
}
