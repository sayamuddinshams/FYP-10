import { useMemo } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatCompact, formatNumber } from '../../utils/format';
import adminService from '../../services/adminService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import { LineChart, BarChart, DonutChart } from '../../components/dashboard/charts';
import { ErrorState } from '../../components/common/Feedback';
import { StatSkeleton, LineSkeleton } from '../../components/common/Skeleton';
import Icon from '../../components/common/icons';

const DONUT_TONES = ['brand', 'success', 'warning', 'danger', 'info', 'neutral'];

function last(arr, key) {
  return arr?.length ? arr[arr.length - 1]?.[key] ?? 0 : 0;
}

function sum(arr, key) {
  return (arr || []).reduce((acc, d) => acc + (Number(d[key]) || 0), 0);
}

function pctShare(arr, key, topLabel) {
  const total = sum(arr, key) || 1;
  const top = arr?.find((d) => d.label === topLabel);
  return { total, pct: Math.round(((top ? Number(top[key]) : 0) / total) * 100) };
}

export default function Analytics() {
  useDocumentTitle('Analytics');
  const { data, loading, error, reload } = useAsync(() => adminService.analytics(), []);

  const a = data;

  const insights = useMemo(() => {
    if (!a) return {};
    const ug = a.userGrowth || [];
    const pg = a.propertyGrowth || [];
    const firstUsers = ug[0]?.users ?? 0;
    const lastUsers = last(ug, 'users');
    const growthPct = firstUsers > 0 ? Math.round(((lastUsers - firstUsers) / firstUsers) * 100) : 0;

    const topLoc = a.popularLocations?.[0]?.label;
    const locShare = pctShare(a.popularLocations, 'value', topLoc);
    const topType = a.popularTypes?.[0]?.label;
    const typeShare = pctShare(a.popularTypes, 'value', topType);

    const peakVisit = [...(a.visitRequests || [])].sort((x, y) => y.value - x.value)[0];
    const conv = a.conversion || [];
    const feeSeries = a.platformFees || [];
    const views = sum(a.ownerViews, 'views');

    return {
      users: `+${growthPct}% net user growth since ${ug[0]?.label || 'launch'}`,
      properties: `${formatNumber(sum(pg, 'properties'))} listings added between ${pg[0]?.label || 'start'} and ${pg[pg.length - 1]?.label || 'now'}`,
      views: `${formatNumber(views)} listing views in the last ${a.ownerViews?.length || 7} days`,
      locations: `${topLoc || 'Gilgit'} leads with ${locShare.pct}% of listing share`,
      types: `${topType || 'Houses'} dominate at ${typeShare.pct}% of listed units`,
      visits: peakVisit ? `${peakVisit.label} was the peak month with ${formatNumber(peakVisit.value)} requests` : 'No visit data yet',
      conversion: `Visit-to-rental conversion is ${conv.length ? `${conv[conv.length - 1].value}%` : '—'} this month`,
      fees: `Rs ${formatNumber(last(feeSeries, 'value'))} collected in ${feeSeries[feeSeries.length - 1]?.label || 'the latest month'}`,
    };
  }, [a]);

  function chartBlock(title, subtitle, children, delay = 0) {
    return (
      <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
        <ChartCard title={title} subtitle={subtitle}>
          {loading ? <LineSkeleton /> : children}
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Growth, engagement and revenue trends across the RentLink marketplace."
      />

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 md:grid-cols-3">
          <StatCard label="New users this month" value={last(a.userGrowth, 'users')} tone="brand" icon={<Icon name="users" className="h-5 w-5" />} />
          <StatCard label="New properties" value={last(a.propertyGrowth, 'properties')} tone="info" icon={<Icon name="building" className="h-5 w-5" />} />
          <StatCard label="Total views" value={sum(a.ownerViews, 'views')} tone="brand" icon={<Icon name="eye" className="h-5 w-5" />} />
          <StatCard label="Conversion rate" value={last(a.conversion, 'value')} suffix="%" tone="success" icon={<Icon name="chart" className="h-5 w-5" />} />
          <StatCard label="Platform fees" value={last(a.platformFees, 'value')} prefix="Rs " tone="warning" icon={<Icon name="coins" className="h-5 w-5" />} />
        </div>
      )}

      {error ? null : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('User Growth', insights.users, (
              <LineChart data={a?.userGrowth || []} valueKey="users" />
            ))}
            {chartBlock('Property Growth', insights.properties, (
              <BarChart data={a?.propertyGrowth || []} valueKey="properties" />
            ), 60)}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('Property Views', insights.views, (
              <BarChart data={a?.ownerViews || []} valueKey="views" />
            ))}
            {chartBlock('Popular Locations', insights.locations, (
              <BarChart data={a?.popularLocations || []} valueKey="value" horizontal />
            ), 60)}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('Popular Property Types', insights.types, (
              <DonutChart
                data={(a?.popularTypes || []).map((d, i) => ({ ...d, tone: DONUT_TONES[i % DONUT_TONES.length] }))}
              />
            ))}
            {chartBlock('Visit Requests', insights.visits, (
              <BarChart data={a?.visitRequests || []} valueKey="value" color="#0284c7" />
            ), 60)}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('Conversion Trends', insights.conversion, (
              <LineChart data={a?.conversion || []} valueKey="value" color="#059669" formatValue={(v) => `${v}%`} />
            ))}
            {chartBlock('Platform Fees', insights.fees, (
              <LineChart data={a?.platformFees || []} valueKey="value" color="#f59e0b" formatValue={formatCompact} />
            ), 60)}
          </div>
        </>
      )}
    </div>
  );
}