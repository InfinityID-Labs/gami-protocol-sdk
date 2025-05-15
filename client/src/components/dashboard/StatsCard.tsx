import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FaArrowUp, FaCircle } from "react-icons/fa";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  change?: {
    value: string;
    positive?: boolean;
  };
  footer?: {
    text: string;
    icon?: React.ReactNode;
  };
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  change,
  footer,
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn("rounded-md p-3", iconBgColor)}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-slate-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-3">
        {change ? (
          <div className={cn(
            "text-sm flex items-center",
            change.positive ? "text-green-600" : "text-amber-600"
          )}>
            {change.positive && <FaArrowUp className="mr-1" />}
            <span>{change.value}</span>
          </div>
        ) : footer ? (
          <div className="text-sm text-slate-600 flex items-center">
            {footer.icon || <FaCircle className="mr-1" size={8} />}
            <span>{footer.text}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
