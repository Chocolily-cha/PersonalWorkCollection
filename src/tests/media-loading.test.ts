import { BASE_PATH, getMediaUrl } from '@/config/paths';

describe('Media URL Generation', () => {
  it('should generate correct URLs without encoding', () => {
    const testPath = '巧克力的作品集/AI动画/视频.mp4';
    const result = getMediaUrl(testPath);
    expect(result).toBe(`${BASE_PATH}/${testPath}`);
    expect(result).toContain('巧克力');
  });

  it('should handle simple paths', () => {
    const testPath = 'thumbnails/video1.jpg';
    const result = getMediaUrl(testPath);
    expect(result).toBe(`${BASE_PATH}/${testPath}`);
  });
});

describe('Array Comparison', () => {
  it('should correctly compare arrays by value', () => {
    const a = ['a', 'b', 'c'];
    const b = ['a', 'b', 'c'];
    const c = ['a', 'c', 'b'];
    
    expect(a !== b).toBe(true);
    expect(JSON.stringify(a) === JSON.stringify(b)).toBe(true);
    expect(JSON.stringify(a) === JSON.stringify(c)).toBe(false);
  });
});

describe('Sorting Config Validation', () => {
  it('should validate sorting config structure', () => {
    const validConfig = {
      version: 1,
      lastUpdated: '2026-06-30',
      description: 'Test',
      workOrder: ['a', 'b', 'c'],
      mediaOrder: {},
    };
    
    expect(validConfig.workOrder).toBeInstanceOf(Array);
    expect(validConfig.workOrder.length).toBeGreaterThan(0);
    expect(typeof validConfig.version).toBe('number');
  });
});