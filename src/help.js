function parseResolution(text) {
  const match = text.trim().match(/^(\d+)\s*[x×]\s*(\d+)$/i);

  if (!match) {
    return null;
  }

  const width = Number(match[1]);
  const height = Number(match[2]);

  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { width, height };
}

export { parseResolution };
