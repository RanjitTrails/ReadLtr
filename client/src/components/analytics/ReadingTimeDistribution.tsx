import { useQuery } from '@tanstack/react-query';
import { getReadingTimeDistribution } from '@/lib/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Sunrise, Sun, Sunset, Moon } from 'lucide-react';

/**
 * Reading Time Distribution Component
 * 
 * Displays when the user typically reads during the day
 */
export default function ReadingTimeDistribution() {
  const { data, isLoading } = useQuery({
    queryKey: ['readingTimeDistribution'],
    queryFn: getReadingTimeDistribution,
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reading Time Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Default data if none is available
  const distribution = data || {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };
  
  // Calculate total and percentages
  const total = distribution.morning + distribution.afternoon + distribution.evening + distribution.night;
  const getPercentage = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
  
  const timeSlots = [
    {
      name: 'Morning',
      value: distribution.morning,
      percentage: getPercentage(distribution.morning),
      icon: Sunrise,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      time: '5 AM - 12 PM',
    },
    {
      name: 'Afternoon',
      value: distribution.afternoon,
      percentage: getPercentage(distribution.afternoon),
      icon: Sun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      time: '12 PM - 6 PM',
    },
    {
      name: 'Evening',
      value: distribution.evening,
      percentage: getPercentage(distribution.evening),
      icon: Sunset,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      time: '6 PM - 12 AM',
    },
    {
      name: 'Night',
      value: distribution.night,
      percentage: getPercentage(distribution.night),
      icon: Moon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      time: '12 AM - 5 AM',
    },
  ];
  
  // Find the preferred reading time
  const preferredTime = timeSlots.reduce(
    (prev, current) => (current.value > prev.value ? current : prev),
    timeSlots[0]
  );
  
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Reading Time Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Not enough data to show reading time distribution.</p>
            <p className="text-sm">Start reading to see when you read the most.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className={`p-3 rounded-full ${preferredTime.bgColor} mr-3`}>
                <preferredTime.icon className={`h-6 w-6 ${preferredTime.color}`} />
              </div>
              <div>
                <p className="text-sm text-zinc-400">You prefer reading in the</p>
                <p className="text-xl font-semibold">{preferredTime.name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {timeSlots.map((slot, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <slot.icon className={`h-4 w-4 ${slot.color} mr-2`} />
                      <span>{slot.name}</span>
                      <span className="text-zinc-500 ml-2 text-xs">({slot.time})</span>
                    </div>
                    <span className="text-zinc-400">{slot.percentage}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${slot.color.replace('text-', 'bg-')}`}
                      style={{ width: `${slot.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
