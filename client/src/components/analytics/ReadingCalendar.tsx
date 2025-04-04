import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReadingHeatmap } from '@/lib/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

interface CalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Reading Calendar Component
 * 
 * Displays a heatmap calendar of reading activity
 */
export default function ReadingCalendar() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  
  // Fetch reading heatmap data
  const { data, isLoading } = useQuery({
    queryKey: ['readingHeatmap', year],
    queryFn: () => getReadingHeatmap(year),
    refetchOnWindowFocus: false,
  });
  
  // Process data for the calendar
  useEffect(() => {
    if (!data) return;
    
    // Find the maximum count to determine intensity levels
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    // Generate all days in the year
    const allDays: CalendarDay[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = data.find(item => item.date === dateStr);
      
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (dayData && dayData.count > 0) {
        const percentage = dayData.count / maxCount;
        if (percentage <= 0.25) level = 1;
        else if (percentage <= 0.5) level = 2;
        else if (percentage <= 0.75) level = 3;
        else level = 4;
      }
      
      allDays.push({
        date: dateStr,
        count: dayData?.count || 0,
        level,
      });
    }
    
    setCalendarData(allDays);
  }, [data, year]);
  
  // Generate years for the dropdown
  const years = [];
  for (let y = currentYear; y >= currentYear - 2; y--) {
    years.push(y);
  }
  
  // Group days by month and week
  const months = [];
  for (let month = 0; month < 12; month++) {
    const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
    const daysInMonth = calendarData.filter(d => {
      const date = new Date(d.date);
      return date.getMonth() === month;
    });
    
    // Group by week
    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    
    // Add empty days for the first week
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }
    
    // Add days to weeks
    daysInMonth.forEach(day => {
      const date = new Date(day.date);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    // Add the last week
    if (currentWeek.length > 0) {
      // Fill the rest of the week with empty days
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, level: 0 });
      }
      weeks.push(currentWeek);
    }
    
    months.push({ name: monthName, weeks });
  }
  
  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reading Activity
            </CardTitle>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reading Activity
          </CardTitle>
          <Select
            value={year.toString()}
            onValueChange={(value) => setYear(parseInt(value))}
          >
            <SelectTrigger className="w-24 h-8 text-sm bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-zinc-400 mb-1 flex justify-end items-center gap-1">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-zinc-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-900/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-700/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-500/40 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {months.map((month, monthIndex) => (
            <div key={monthIndex} className="space-y-1">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">{month.name}</h4>
              <div className="space-y-1">
                {month.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${
                          day.date
                            ? day.level === 0
                              ? 'bg-zinc-800'
                              : day.level === 1
                              ? 'bg-blue-900/40'
                              : day.level === 2
                              ? 'bg-blue-700/40'
                              : day.level === 3
                              ? 'bg-blue-500/40'
                              : 'bg-blue-400'
                            : 'bg-transparent'
                        }`}
                        title={day.date ? `${day.date}: ${day.count} articles` : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
