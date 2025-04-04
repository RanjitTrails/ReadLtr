import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Target, 
  Sparkles, 
  Hash, 
  Calendar 
} from 'lucide-react';
import StatsSummary from '@/components/analytics/StatsSummary';
import ReadingCalendar from '@/components/analytics/ReadingCalendar';
import ReadingTimeDistribution from '@/components/analytics/ReadingTimeDistribution';
import ReadingGoals from '@/components/analytics/ReadingGoals';
import TopicInterests from '@/components/analytics/TopicInterests';
import Recommendations from '@/components/analytics/Recommendations';
import { useAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

/**
 * Analytics Dashboard Page
 * 
 * Main page for displaying reading statistics and insights
 */
export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!user) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center py-12">
            <BarChart className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
            <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
              Sign in to view your reading statistics, track your progress, and get personalized recommendations.
            </p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-zinc-400">Track your reading habits and get insights</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
              <BarChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-zinc-800">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-zinc-800">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="interests" className="data-[state=active]:bg-zinc-800">
              <Hash className="h-4 w-4 mr-2" />
              Interests
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <StatsSummary />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReadingCalendar />
              <ReadingTimeDistribution />
            </div>
          </TabsContent>
          
          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <ReadingGoals />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReadingCalendar />
              <ReadingTimeDistribution />
            </div>
          </TabsContent>
          
          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Recommendations />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopicInterests />
              <ReadingTimeDistribution />
            </div>
          </TabsContent>
          
          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6">
            <TopicInterests />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Recommendations />
              <ReadingCalendar />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
