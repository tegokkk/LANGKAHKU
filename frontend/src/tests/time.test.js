import { it,expect } from 'vitest';
import { formatDate,setSchoolTimezone } from '../utils/time';
it('dates follow the configured school zone, including crossing midnight',()=>{
  const instant='2026-11-22T16:30:00Z';setSchoolTimezone('Asia/Jakarta');expect(formatDate(instant,true)).toContain('22 Nov');setSchoolTimezone('Asia/Makassar');expect(formatDate(instant,true)).toContain('23 Nov');setSchoolTimezone();expect(formatDate(instant,true)).toContain('22 Nov');
});
