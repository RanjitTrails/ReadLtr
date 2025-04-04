import { useQuery } from '@tanstack/react-query';
import { getAggregatedStats } from '@/lib/analyticsService';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  Flame, 
  Zap 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Stats Summary Component
 * 
 * Displays a summary of the user's reading statistics
 */
export default function StatsSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['aggregatedStats'],
    queryFn: getAggregatedStats,
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const stats = [
    {
      label: 'Articles Read',
      value: data?.totalArticlesRead || 0,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Reading Time',
      value: formatTime(data?.totalMinutesRead || 0),
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Words Read',
      value: formatNumber(data?.totalWordsRead || 0),
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Current Streak',
      value: `${data?.currentStreak || 0} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Reading Speed',
      value: `${data?.averageReadingSpeed || 0} wpm`,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
