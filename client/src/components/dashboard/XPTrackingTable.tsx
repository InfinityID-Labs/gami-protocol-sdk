import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface XPEvent {
  eventName: string;
  count: number;
  avgXp: number;
  status: string;
}

interface XPTrackingTableProps {
  events: XPEvent[];
  isLoading?: boolean;
}

export default function XPTrackingTable({ events, isLoading = false }: XPTrackingTableProps) {
  const [timeRange, setTimeRange] = useState("7days");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-slate-100 text-slate-800";
      case "testing":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">XP Tracking Events</h3>
        <div>
          <select
            className="text-sm border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="alltime">All time</option>
          </select>
        </div>
      </div>
      <div className="px-5 py-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Count
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Avg XP
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                  Loading events...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((event, index) => (
                <tr key={index}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-900">
                    {event.eventName}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600">
                    {event.count.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600">
                    {event.avgXp}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        getStatusBadgeClass(event.status)
                      )}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-5 py-4 flex justify-between items-center">
        <span className="text-sm text-slate-500">
          Showing {events.length} of {events.length} events
        </span>
        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
          View All
        </button>
      </div>
    </Card>
  );
}
