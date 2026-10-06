import { describe, expect, it } from 'vitest';
import {
  WORKBOOK_PAGE_ARCHETYPES,
  WorkbookArchetype,
  archetypeMappingForPage,
  pagesForArchetype,
} from '../workbook-archetypes';
import { lessonForWorkbookPage } from '../../lib/workbook-pages';
import pageLayouts from '../page-layouts.json';

describe('Workbook Archetype Mapping', () => {
  it('contains exactly 90 printed pages in consecutive order', () => {
    expect(WORKBOOK_PAGE_ARCHETYPES).toHaveLength(90);
    WORKBOOK_PAGE_ARCHETYPES.forEach((mapping, index) => {
      expect(mapping.printedPage).toBe(index + 1);
    });
  });

  it('marks printed pages 86 and 87 strictly as SOURCE_BLOCKED with empty archetypes', () => {
    const page86 = archetypeMappingForPage(86);
    const page87 = archetypeMappingForPage(87);

    expect(page86.sourceStatus).toBe('SOURCE_BLOCKED');
    expect(page86.archetypes).toHaveLength(0);
    expect(page86.regionTypes).toHaveLength(0);
    expect(page86.sourceNote).toContain('SOURCE_BLOCKED');

    expect(page87.sourceStatus).toBe('SOURCE_BLOCKED');
    expect(page87.archetypes).toHaveLength(0);
    expect(page87.regionTypes).toHaveLength(0);
    expect(page87.sourceNote).toContain('SOURCE_BLOCKED');
  });

  it('ensures every available page 1–85 and 88–90 has status AVAILABLE and at least one archetype', () => {
    for (let p = 1; p <= 90; p++) {
      if (p === 86 || p === 87) continue;

      const mapping = archetypeMappingForPage(p);
      expect(mapping.sourceStatus).toBe('AVAILABLE');
      expect(mapping.archetypes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('identifies page 17 as the Uu representative for Archetype 4 (SINGLE_TARGET_SURROUNDING_PICTURES)', () => {
    const page17 = archetypeMappingForPage(17);
    expect(page17.printedPage).toBe(17);
    expect(page17.lessonNumber).toBe(6);
    expect(page17.archetypes).toContain(WorkbookArchetype.SINGLE_TARGET_SURROUNDING_PICTURES);
  });

  it('aligns lesson numbers with lessonForWorkbookPage helper', () => {
    WORKBOOK_PAGE_ARCHETYPES.forEach((mapping) => {
      const expectedLesson = lessonForWorkbookPage(mapping.printedPage);
      expect(mapping.lessonNumber).toBe(expectedLesson);
    });
  });

  it('aligns region types with page-layouts.json for every page', () => {
    WORKBOOK_PAGE_ARCHETYPES.forEach((mapping) => {
      if (mapping.sourceStatus === 'SOURCE_BLOCKED') {
        expect(mapping.regionTypes).toEqual([]);
        return;
      }
      const layoutPage = (pageLayouts.pages as Record<string, { regions: Array<{ regionType: string }> }>)[
        String(mapping.printedPage)
      ];
      expect(layoutPage).toBeDefined();
      const layoutRegionTypes = layoutPage.regions.map((r) => r.regionType);
      expect(mapping.regionTypes).toEqual(layoutRegionTypes);
    });
  });

  it('allows querying pages for specific archetypes', () => {
    const archetype3Pages = pagesForArchetype(WorkbookArchetype.MULTI_PAIR_MATCHING);
    expect(archetype3Pages.map((p) => p.printedPage)).toEqual([3]);
    const archetype4Pages = pagesForArchetype(WorkbookArchetype.SINGLE_TARGET_SURROUNDING_PICTURES);
    expect(archetype4Pages.map((p) => p.printedPage)).toEqual([5, 8, 11, 14, 17]);
  });
});
