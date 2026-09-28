import { describe, expect, it } from 'vitest';
import { ensureSvgSize } from './svg-size';

describe('ensureSvgSize', () => {
  it('thêm width/height từ viewBox, chuẩn hóa chiều rộng 600', () => {
    const out = ensureSvgSize(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect/></svg>'
    );
    expect(out).toMatch(/<svg[^>]*\swidth="600"/);
    expect(out).toMatch(/<svg[^>]*\sheight="400"/);
  });
  it('giữ nguyên nếu đã có width và height', () => {
    const svg = '<svg width="300" height="200" viewBox="0 0 3 2"></svg>';
    expect(ensureSvgSize(svg)).toBe(svg);
  });
  it('ném lỗi nếu không có viewBox lẫn kích thước', () => {
    expect(() => ensureSvgSize('<svg></svg>')).toThrow();
  });
  it('coi width/height theo % là thiếu và thay bằng kích thước từ viewBox', () => {
    const out = ensureSvgSize('<svg width="100%" height="100%" viewBox="0 0 1200 800"></svg>');
    expect(out).toBe('<svg width="600" height="400" viewBox="0 0 1200 800"></svg>');
  });
  it('chấp nhận kích thước dạng số mũ (width="1e3") như cờ Campuchia trên Commons', () => {
    const svg = '<svg width="1e3" height="640" version="1.1"></svg>';
    expect(ensureSvgSize(svg)).toBe(svg);
  });
  it('chỉ có một trong width/height thì suy ra từ viewBox', () => {
    const out = ensureSvgSize('<svg\n  width="900"\n  viewBox="0,0,900,450"><g/></svg>');
    expect(out).toMatch(/<svg width="600" height="300"/);
    expect(out).not.toMatch(/width="900"/);
  });
});
