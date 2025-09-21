import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getPaymentsOverviewData } from "@/services/charts.services";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

type Point = { x: unknown; y: number };

type Series = {
  received: Point[];
  due: Point[];
};

export async function PaymentsOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = (await getPaymentsOverviewData(timeFrame)) as Series;

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Content Overview
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="payments_overview" />
      </div>

      <PaymentsOverviewChart data={data} />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-2 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-dark dark:text-white">
            {standardFormat(data.received.reduce((acc: number, { y }) => acc + y, 0))}
          </dt>
          <dd className="font-medium dark:text-dark-6">Published (total)</dd>
        </div>

        <div>
          <dt className="text-xl font-bold text-dark dark:text-white">
            {standardFormat(data.due.reduce((acc: number, { y }) => acc + y, 0))}
          </dt>
          <dd className="font-medium dark:text-dark-6">Drafts (total)</dd>
        </div>
      </dl>
    </div>
  );
}
