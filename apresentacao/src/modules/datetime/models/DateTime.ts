import { addDays } from "date-fns";

export class DateTime {
  private date: Date;

  constructor(date?: Date) {
    this.date = date || new Date();
  }

  plusDays(days: number) {
    this.date = addDays(this.date, days);
	  return this
  }

  getFullDate(date?: Date) {
    return (date || this.date).toISOString().split("T")[0];
  }
}