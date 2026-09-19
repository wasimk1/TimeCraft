import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { dateDifference, timeDifference, timeSeconds } from './calculations';
@Component({
  selector: 'app-root',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly timeFields = [
    { key: 'startTime', label: 'Start time' },
    { key: 'endTime', label: 'End time' },
  ] as const;
  mode: 'date' | 'time' = 'date';
  startDate = '';
  endDate = '';
  startTime = '';
  endTime = '';
  includeEndDay = false;
  error = '';
  dateResult: ReturnType<typeof dateDifference> | null = null;
  timeResult: ReturnType<typeof timeDifference> | null = null;
  switchMode(mode: 'date' | 'time') {
    this.mode = mode;
    this.error = '';
  }
  clearResult() {
    this.error = '';
    this.mode === 'date' ? (this.dateResult = null) : (this.timeResult = null);
  }
  calculate() {
    this.clearResult();
    try {
      if (this.mode === 'date')
        this.dateResult = dateDifference(this.startDate, this.endDate, this.includeEndDay);
      else this.timeResult = timeDifference(this.startTime, this.endTime);
    } catch (error) {
      this.error = (error as Error).message;
    }
  }
  reset() {
    this.clearResult();
    if (this.mode === 'date') {
      this.startDate = this.endDate = '';
      this.includeEndDay = false;
    } else this.startTime = this.endTime = '';
  }
  updateInclusion() {
    if (this.dateResult) this.calculate();
    else this.clearResult();
  }
  setEndDateToday() {
    const today = new Date();
    this.endDate = [
      String(today.getFullYear()).padStart(4, '0'),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    this.clearResult();
  }
  // Shortcuts change only their own field, relative to its value (or now).
  quickFill(field: 'startTime' | 'endTime', minutes: number) {
    this.clearResult();
    const now = new Date();
    const current = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const base = minutes === 0 || !this[field] ? current : timeSeconds(this[field]);
    const total = (base + minutes * 60) % 86400;
    this[field] = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }
}
