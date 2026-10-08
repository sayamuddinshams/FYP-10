import { useMemo } from 'react';
import { useAsync, useDocumentTitle } from '../../hooks';
import { formatCompact, formatNumber } from '../../utils/format';
import adminService from '../../services/adminService';
import PageHeader from '../../components/dashboard/PageHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import { LineChart, BarChart, DonutChart } from '../../components/dashboard/charts';
import { ErrorState } from '../../components/common/Feedback';
import EmptyState from '../../components/common/EmptyState';
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
    const viewSpan = a.ownerViews?.length
      ? `${a.ownerViews[0].label} – ${a.ownerViews[a.ownerViews.length - 1].label}`
      : '';

    return {
      users:
        ug.length >= 2 && firstUsers > 0
          ? `${formatNumber(lastUsers)} users as of ${ug[ug.length - 1].label}, up ${growthPct}% since ${ug[0].label}`
          : ug.length
            ? `${formatNumber(lastUsers)} users as of ${ug[ug.length - 1].label}`
            : 'No user-growth data yet',
      properties: pg.length
        ? `${formatNumber(sum(pg, 'properties'))} listings tracked between ${pg[0].label} and ${pg[pg.length - 1].label}`
        : 'No listing-growth data yet',
      views: views > 0 ? `${formatNumber(views)} listing views across ${viewSpan}` : 'No listing views recorded yet',
      locations: topLoc
        ? `${topLoc} leads with ${locShare.pct}% of ${formatNumber(locShare.total)} listings`
        : 'No location data yet',
      types: topType
        ? `${topType} accounts for ${typeShare.pct}% of ${formatNumber(typeShare.total)} listed units`
        : 'No property-type data yet',
      visits: peakVisit ? `${peakVisit.label} was the peak month with ${formatNumber(peakVisit.value)} requests` : 'No visit data yet',
      conversion: conv.length
        ? `Visit-to-rental conversion is ${conv[conv.length - 1].value}% in ${conv[conv.length - 1].label}`
        : 'No conversion data yet',
      fees: feeSeries.length
        ? `Rs ${formatNumber(last(feeSeries, 'value'))} collected in ${feeSeries[feeSeries.length - 1].label}`
        : 'No platform-fee income recorded yet',
    };
  }, [a]);

  function chartBlock(title, subtitle, dataset, children, delay = 0) {
    return (
      <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
        <ChartCard title={title} subtitle={subtitle}>
          {loading ? (
            <LineSkeleton />
          ) : !dataset?.length ? (
            <EmptyState
              icon="chart"
              title="No data yet"
              message="This chart will populate as platform activity is recorded."
            />
          ) : (
            children
          )}
        </ChartCard>
      </div>
    );
  }

  // Real value when the series exists, an em dash when it does not — never a fabricated 0.
  const seriesValue = (arr, key) => (arr?.length ? last(arr, key) : '—');
  const seriesNumeric = (arr) => Boolean(arr?.length);
  const seriesPeriod = (arr) => (arr?.length ? ` (${last(arr, 'label')})` : '');

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
          <StatCard
            label={`Total users${seriesPeriod(a?.userGrowth)}`}
            value={seriesValue(a?.userGrowth, 'users')}
            numeric={seriesNumeric(a?.userGrowth)}
            tone="brand"
            icon={<Icon name="users" className="h-5 w-5" />}
          />
          <StatCard
            label={`Total properties${seriesPeriod(a?.propertyGrowth)}`}
            value={seriesValue(a?.propertyGrowth, 'properties')}
            numeric={seriesNumeric(a?.propertyGrowth)}
            tone="info"
            icon={<Icon name="building" className="h-5 w-5" />}
          />
          <StatCard
            label={`Listing views${a?.ownerViews?.length ? ` (${a.ownerViews[0].label} – ${last(a.ownerViews, 'label')})` : ''}`}
            value={a?.ownerViews?.length ? sum(a.ownerViews, 'views') : '—'}
            numeric={seriesNumeric(a?.ownerViews)}
            tone="brand"
            icon={<Icon name="eye" className="h-5 w-5" />}
          />
          <StatCard
            label={`Conversion rate${seriesPeriod(a?.conversion)}`}
            value={seriesValue(a?.conversion, 'value')}
            numeric={seriesNumeric(a?.conversion)}
            suffix={seriesNumeric(a?.conversion) ? '%' : ''}
            tone="success"
            icon={<Icon name="chart" className="h-5 w-5" />}
          />
          <StatCard
            label={`Platform fees${seriesPeriod(a?.platformFees)}`}
            value={seriesValue(a?.platformFees, 'value')}
            numeric={seriesNumeric(a?.platformFees)}
            prefix={seriesNumeric(a?.platformFees) ? 'Rs ' : ''}
            tone="warning"
            icon={<Icon name="coins" className="h-5 w-5" />}
          />
        </div>
      )}

      {error ? null : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('User Growth', insights.users, a?.userGrowth, (
              <LineChart data={a?.userGrowth || []} valueKey="users" />
            ))}
            {chartBlock('Property Growth', insights.properties, a?.propertyGrowth, (
              <BarChart data={a?.propertyGrowth || []} valueKey="properties" />
            ), 60)}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('Property Views', insights.views, a?.ownerViews, (
              <BarChart data={a?.ownerViews || []} valueKey="views" />
            ))}
            {chartBlock('Popular Locations', insights.locations, a?.popularLocations, (
              <BarChart data={a?.popularLocations || []} valueKey="value" horizontal />
            ), 60)}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('Popular Property Types', insights.types, a?.popularTypes, (
              <DonutChart
                data={(a?.popularTypes || []).map((d, i) => ({ ...d, tone: DONUT_TONES[i % DONUT_TONES.length] }))}
              />
            ))}
            {chartBlock('Visit Requests', insights.visits, a?.visitRequests, (
              <BarChart data={a?.visitRequests || []} valueKey="value" color="#0284c7" />
            ), 60)}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {chartBlock('Conversion Trends', insights.conversion, a?.conversion, (
              <LineChart data={a?.conversion || []} valueKey="value" color="#059669" formatValue={(v) => `${v}%`} />
            ))}
            {chartBlock('Platform Fees', insights.fees, a?.platformFees, (
              <LineChart data={a?.platformFees || []} valueKey="value" color="#f59e0b" formatValue={formatCompact} />
            ), 60)}
          </div>
        </>
      )}
    </div>
  );
}