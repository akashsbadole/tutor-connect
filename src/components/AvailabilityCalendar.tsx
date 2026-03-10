import { Clock } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am - 7pm

interface AvailabilityCalendarProps {
  availability: string[];
}

function parseSlot(slot: string) {
  const match = slot.match(/^(\w{3})\s+(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/);
  if (!match) return null;
  return {
    day: match[1],
    startH: parseInt(match[2]),
    startM: parseInt(match[3]),
    endH: parseInt(match[4]),
    endM: parseInt(match[5]),
  };
}

const AvailabilityCalendar = ({ availability }: AvailabilityCalendarProps) => {
  const parsed = availability.map(parseSlot).filter(Boolean);

  const isAvailable = (day: string, hour: number) => {
    return parsed.some(
      (s) => s && s.day === day && hour >= s.startH && hour < s.endH
    );
  };

  const getSlotLabel = (day: string, hour: number) => {
    const slot = parsed.find(
      (s) => s && s.day === day && s.startH === hour
    );
    if (!slot) return null;
    return `${String(slot.startH).padStart(2, "0")}:${String(slot.startM).padStart(2, "0")} - ${String(slot.endH).padStart(2, "0")}:${String(slot.endM).padStart(2, "0")}`;
  };

  if (parsed.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="flex items-center gap-2 font-serif text-sm font-bold text-card-foreground">
        <Clock className="h-4 w-4 text-primary" /> Weekly Availability
      </h3>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-px text-center text-xs font-medium text-muted-foreground">
            <div />
            {DAYS.map((d) => (
              <div key={d} className="py-1.5">{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="mt-1 grid grid-cols-8 gap-px rounded-lg bg-border overflow-hidden">
            {HOURS.map((hour) => (
              <>
                <div
                  key={`label-${hour}`}
                  className="flex items-center justify-end bg-card pr-2 text-[10px] text-muted-foreground"
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
                {DAYS.map((day) => {
                  const available = isAvailable(day, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-7 transition-colors ${
                        available
                          ? "bg-primary/20 border-primary/30"
                          : "bg-card"
                      }`}
                      title={
                        available
                          ? getSlotLabel(day, hour) || `${day} ${hour}:00 - available`
                          : undefined
                      }
                    />
                  );
                })}
              </>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/20" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-card border border-border" /> Unavailable
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
