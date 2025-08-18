import { createEvent } from 'ics';

export async function buildICS({ title, description, location, start, end }:{
  title: string; description?: string; location?: string; start: Date; end: Date;
}) {
  return new Promise<string>((resolve, reject) => {
    createEvent({
      title, description, location,
      start: [start.getFullYear(), start.getMonth()+1, start.getDate(), start.getHours(), start.getMinutes()],
      end:   [end.getFullYear(),   end.getMonth()+1,   end.getDate(),   end.getHours(),   end.getMinutes()],
      alarms: [{ action: 'display', trigger: { hours: 24, before: true } }]
    }, (err, value) => err ? reject(err) : resolve(value));
  });
}
