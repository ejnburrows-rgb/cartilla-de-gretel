import { bench, describe } from 'vitest';

describe('FlipchartNativeBoard - array filtering', () => {
  // Generate a mock `native.body` array
  const createMockBody = (size) => {
    return Array.from({ length: size }, (_, i) => ({
      id: i,
      y: Math.random() * 1000,
      text: i % 10 === 0 ? 'a' : `text ${i}`,
    }));
  };

  const smallBody = createMockBody(10);
  const mediumBody = createMockBody(100);
  const largeBody = createMockBody(1000);

  bench('small array - original', () => {
    const verseLines = smallBody.filter((item) => item.y < 500 && item.text.trim().length > 0);
    const vowelCircles = smallBody.filter(
      (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
    );
    const remainingBody = smallBody.filter((item) => !verseLines.includes(item) && !vowelCircles.includes(item));
  });

  bench('small array - optimized Set', () => {
    const verseLines = smallBody.filter((item) => item.y < 500 && item.text.trim().length > 0);
    const vowelCircles = smallBody.filter(
      (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
    );
    const verseLinesSet = new Set(verseLines);
    const vowelCirclesSet = new Set(vowelCircles);
    const remainingBody = smallBody.filter((item) => !verseLinesSet.has(item) && !vowelCirclesSet.has(item));
  });

  bench('medium array - original', () => {
    const verseLines = mediumBody.filter((item) => item.y < 500 && item.text.trim().length > 0);
    const vowelCircles = mediumBody.filter(
      (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
    );
    const remainingBody = mediumBody.filter((item) => !verseLines.includes(item) && !vowelCircles.includes(item));
  });

  bench('medium array - optimized Set', () => {
    const verseLines = mediumBody.filter((item) => item.y < 500 && item.text.trim().length > 0);
    const vowelCircles = mediumBody.filter(
      (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
    );
    const verseLinesSet = new Set(verseLines);
    const vowelCirclesSet = new Set(vowelCircles);
    const remainingBody = mediumBody.filter((item) => !verseLinesSet.has(item) && !vowelCirclesSet.has(item));
  });

  bench('large array - original', () => {
    const verseLines = largeBody.filter((item) => item.y < 500 && item.text.trim().length > 0);
    const vowelCircles = largeBody.filter(
      (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
    );
    const remainingBody = largeBody.filter((item) => !verseLines.includes(item) && !vowelCircles.includes(item));
  });

  bench('large array - optimized Set', () => {
    const verseLines = largeBody.filter((item) => item.y < 500 && item.text.trim().length > 0);
    const vowelCircles = largeBody.filter(
      (item) => item.y >= 450 && item.y < 650 && item.text.trim().length === 1 && /^[aeiou]/i.test(item.text.trim())
    );
    const verseLinesSet = new Set(verseLines);
    const vowelCirclesSet = new Set(vowelCircles);
    const remainingBody = largeBody.filter((item) => !verseLinesSet.has(item) && !vowelCirclesSet.has(item));
  });
});
