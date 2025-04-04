import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReadingGoals,
  getGoalProgress,
  createReadingGoal,
  updateReadingGoal,
  deleteReadingGoal
} from '@/lib/analyticsService';
import { ReadingGoal } from '@shared/analytics-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Target,
  Plus,
  Check,
  Clock,
  BookOpen,
  Calendar,
  Trash2,
  Edit,
  X,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

// Form schema for creating/editing goals
const goalFormSchema = z.object({
  goal_type: z.enum(['daily', 'weekly', 'monthly']),
  target_count: z.coerce.number().min(1, 'Target must be at least 1'),
  target_unit: z.enum(['articles', 'minutes']),
  start_date: z.string(),
  end_date: z.string().optional(),
  is_recurring: z.boolean().default(false),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

/**
 * Reading Goals Component
 *
 * Displays and manages reading goals
 */
export default function ReadingGoals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ReadingGoal | null>(null);
  const queryClient = useQueryClient();

  // Fetch reading goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['readingGoals'],
    queryFn: getReadingGoals,
    refetchOnWindowFocus: false,
  });

  // Fetch goal progress for each goal
  const goalProgressQueries = useQuery({
    queryKey: ['goalProgress', goals.map(g => g.id).join(',')],
    queryFn: async () => {
      const progressData = await Promise.all(
        goals.map(goal => getGoalProgress(goal.id))
      );
      return progressData.filter(Boolean);
    },
    enabled: goals.length > 0,
    refetchOnWindowFocus: false,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: createReadingGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingGoals'] });
      toast({
        title: 'Goal created',
        description: 'Your reading goal has been created successfully.',
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create goal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ReadingGoal> }) =>
      updateReadingGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goalProgress'] });
      toast({
        title: 'Goal updated',
        description: 'Your reading goal has been updated successfully.',
      });
      setIsDialogOpen(false);
      setEditingGoal(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: deleteReadingGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingGoals'] });
      toast({
        title: 'Goal deleted',
        description: 'Your reading goal has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Form for creating/editing goals
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goal_type: 'daily',
      target_count: 1,
      target_unit: 'articles',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      is_recurring: false,
    },
  });

  // Handle form submission
  const onSubmit = (values: GoalFormValues) => {
    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        updates: values,
      });
    } else {
      createGoalMutation.mutate(values);
    }
  };

  // Open dialog for editing a goal
  const handleEditGoal = (goal: ReadingGoal) => {
    setEditingGoal(goal);
    form.reset({
      goal_type: goal.goal_type,
      target_count: goal.target_count,
      target_unit: goal.target_unit,
      start_date: goal.start_date,
      end_date: goal.end_date,
      is_recurring: goal.is_recurring,
    });
    setIsDialogOpen(true);
  };

  // Open dialog for creating a new goal
  const handleNewGoal = () => {
    setEditingGoal(null);
    form.reset({
      goal_type: 'daily',
      target_count: 1,
      target_unit: 'articles',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      is_recurring: false,
    });
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setEditingGoal(null);
      form.reset();
    }, 300);
  };

  // Format goal type for display
  const formatGoalType = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Target className="h-5 w-5" />
              Reading Goals
            </CardTitle>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5" />
            Reading Goals
          </CardTitle>
          <Button size="sm" onClick={handleNewGoal}>
            <Plus className="h-4 w-4 mr-1" />
            New Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>You don't have any reading goals yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleNewGoal}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create your first goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = goalProgressQueries.data?.find(p => p?.goal.id === goal.id);

              return (
                <div
                  key={goal.id}
                  className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {formatGoalType(goal.goal_type)} Goal
                        </h3>
                        {goal.is_recurring && (
                          <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full">
                            Recurring
                          </span>
                        )}
                        {progress?.isCompleted && (
                          <span className="text-xs bg-green-900/30 text-green-300 px-2 py-0.5 rounded-full flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 flex items-center mt-1">
                        {goal.target_unit === 'articles' ? (
                          <BookOpen className="h-3.5 w-3.5 mr-1 text-blue-400" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 mr-1 text-green-400" />
                        )}
                        {goal.target_count} {goal.target_unit} {goal.goal_type}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white"
                        onClick={() => handleEditGoal(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this goal?')) {
                            deleteGoalMutation.mutate(goal.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {goalProgressQueries.isLoading ? (
                    <Skeleton className="h-2 w-full mt-2" />
                  ) : (
                    <div className="space-y-1">
                      <Progress
                        value={progress?.progress || 0}
                        className="h-2"
                        indicatorClassName={
                          progress?.isCompleted
                            ? 'bg-green-500'
                            : progress?.progress && progress.progress > 66
                            ? 'bg-blue-500'
                            : progress?.progress && progress.progress > 33
                            ? 'bg-blue-600'
                            : 'bg-blue-700'
                        }
                      />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>
                          {Math.round(progress?.progress || 0)}% complete
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(goal.start_date), 'MMM d, yyyy')}
                          {goal.end_date && ` - ${format(new Date(goal.end_date), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Goal Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'Edit Reading Goal' : 'Create Reading Goal'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="goal_type"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Goal Type</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <FormLabel htmlFor="daily" className="font-normal">
                          Daily
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <FormLabel htmlFor="weekly" className="font-normal">
                          Weekly
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <FormLabel htmlFor="monthly" className="font-normal">
                          Monthly
                        </FormLabel>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="target_count"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Target</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          className="bg-zinc-800 border-zinc-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_unit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="articles">Articles</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-zinc-800 border-zinc-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-zinc-800 border-zinc-700"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Recurring Goal</FormLabel>
                      <p className="text-sm text-zinc-500">
                        Automatically reset this goal when the period ends
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    createGoalMutation.isPending || updateGoalMutation.isPending
                  }
                >
                  {createGoalMutation.isPending || updateGoalMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      {editingGoal ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
