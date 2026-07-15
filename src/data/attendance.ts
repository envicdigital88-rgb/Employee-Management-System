import { AttendanceRecord, AttendanceStatus } from '../types';
import { employees } from './employees';

// Generate the last 14 days of attendance for every employee (deterministic).
const STATUSES: AttendanceStatus[] = [
'Present',
'Present',
'Present',
'WFH',
'Late',
'Absent'];


function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

const today = new Date();

export const attendanceRecords: AttendanceRecord[] = (() => {
  const records: AttendanceRecord[] = [];
  let counter = 1;
  for (let d = 1; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    employees.forEach((emp, i) => {
      if (isWeekend) return;
      const seed = i * 7 + d * 3;
      let status: AttendanceStatus =
      emp.status === 'On Leave' && d < 5 ?
      'On Leave' :
      seededPick(STATUSES, seed);
      let clockIn: string | null = null;
      let clockOut: string | null = null;
      let hours = 0;
      if (status === 'Present' || status === 'WFH' || status === 'Late') {
        const inHour = status === 'Late' ? 9 + seed % 2 : 8 + seed % 2;
        const inMin = seed * 13 % 60;
        clockIn = `${pad(inHour)}:${pad(inMin)}`;
        const outHour = 17 + seed % 2;
        clockOut = `${pad(outHour)}:${pad(seed * 7 % 60)}`;
        hours = Math.max(6, Math.min(9, outHour - inHour + 1));
      }
      records.push({
        id: `ATT-${counter++}`,
        employeeId: emp.id,
        date: iso,
        status,
        clockIn,
        clockOut,
        hours
      });
    });
  }
  return records;
})();

export const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
  today.getDate()
)}`;