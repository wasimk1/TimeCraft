import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { dateDifference, timeDifference } from './calculations';

describe('Calculations', () => {
  it('includes the end day consistently and rejects reversed ranges', () => {
    expect(dateDifference('2026-01-01', '2026-01-31').days).toBe(30);
    expect(dateDifference('2026-01-01', '2026-01-31', true)).toMatchObject({
      days: 31,
      months: 1,
      remainder: 0,
      hours: 744,
      working: 22,
      weekends: 9,
    });
    expect(dateDifference('2026-01-31', '2026-01-31', true).days).toBe(1);
    expect(() => dateDifference('2026-02-01', '2026-01-31', true)).toThrow();
  });
  it('calculates seconds and crosses midnight precisely', () => {
    expect(timeDifference('09:30:15', '18:45:45')).toMatchObject({
      hours: 9,
      minutes: 15,
      seconds: 30,
      totalSeconds: 33330,
      total: 555.5,
    });
    expect(timeDifference('23:59:59', '00:00:01')).toMatchObject({
      totalSeconds: 2,
      overnight: true,
    });
    expect(timeDifference('12:00:00', '12:00:00').totalSeconds).toBe(0);
    expect(() => timeDifference('12:00:60', '13:00:00')).toThrow();
  });
  it('quick fills each time independently and preserves seconds', () => {
    const app = new App();
    app.startTime = '09:00:15';
    app.endTime = '17:00:45';
    app.quickFill('startTime', 30);
    expect(app.startTime).toBe('09:30:15');
    expect(app.endTime).toBe('17:00:45');
    app.quickFill('endTime', 60);
    expect(app.endTime).toBe('18:00:45');
    expect(app.startTime).toBe('09:30:15');
  });

  it('calculates the example date range', () => {
    expect(dateDifference('2026-09-19', '2026-12-25')).toMatchObject({
      days: 97,
      months: 3,
      remainder: 6,
      weeks: 13,
      weekDays: 6,
      hours: 2328,
      working: 69,
      weekends: 28,
    });
  });
  it('handles leap days and daylight-saving boundaries', () => {
    expect(dateDifference('2024-02-28', '2024-03-01').days).toBe(2);
    expect(dateDifference('2026-03-07', '2026-03-09').days).toBe(2);
  });
  it('clamps month ends and permits identical dates', () => {
    expect(dateDifference('2024-01-31', '2024-02-29')).toMatchObject({ months: 1, remainder: 0 });
    expect(dateDifference('2026-09-19', '2026-09-19')).toMatchObject({
      days: 0,
      working: 0,
      weekends: 0,
    });
  });
  it('rejects missing, invalid and reversed dates', () => {
    expect(() => dateDifference('', '')).toThrow();
    expect(() => dateDifference('2026-02-30', '2026-03-05')).toThrow();
    expect(() => dateDifference('2026-09-20', '2026-09-19')).toThrow();
  });
  it('calculates minutes accurately and supports overnight ranges', () => {
    expect(timeDifference('09:30', '18:45')).toMatchObject({
      hours: 9,
      minutes: 15,
      total: 555,
      decimal: 9.25,
    });
    expect(timeDifference('22:00', '02:00')).toMatchObject({ hours: 4, overnight: true });
    expect(timeDifference('23:50', '00:10').total).toBe(20);
    expect(timeDifference('12:00', '12:00').total).toBe(0);
    expect(() => timeDifference('', '24:00')).toThrow();
  });
});

describe('TimeCraft', () => {
  it('renders and calculates, validates and resets', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('TimeCraft');
    app.calculate();
    expect(app.error).toContain('both dates');
    app.startDate = '2026-09-19';
    app.endDate = '2026-12-25';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    app.calculate();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(app.dateResult?.days).toBe(97);
    app.reset();
    expect(app.startDate).toBe('');
    expect(app.dateResult).toBeNull();
    expect(app.error).toBe('');
    app.switchMode('time');
    app.startTime = '22:00';
    app.endTime = '22:00';
    app.quickFill('endTime', 480);
    expect(app.endTime).toBe('06:00:00');
    app.calculate();
    expect(app.timeResult?.total).toBe(480);
    app.reset();
    expect(app.timeResult).toBeNull();
    expect(app.startTime).toBe('');
  });
});
