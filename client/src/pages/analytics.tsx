import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { FaUsers, FaTrophy, FaWallet, FaCalendarAlt } from "react-icons/fa";

// Types for analytics data
interface OverviewStats {
  activeUsers: number;
  xpTransactions: number;
  activeCampaigns: number;
  rewardsDistributed: number;
}

interface EventData {
  eventName: string;
  count: number;
  avgXp: number;
  status: string;
}

interface UserRetentionData {
  day: string;
  rate: number;
}

interface XpDistributionData {
  range: string;
  count: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch analytics data
  const { data: stats, isLoading: isLoadingStats } = useQuery<OverviewStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: events = [], isLoading: isLoadingEvents } = useQuery<EventData[]>({
    queryKey: ['/api/admin/events'],
  });

  // Sample data for charts that would typically come from API
  const userRetentionData: UserRetentionData[] = [
    { day: "Day 1", rate: 100 },
    { day: "Day 2", rate: 80 },
    { day: "Day 3", rate: 65 },
    { day: "Day 7", rate: 50 },
    { day: "Day 14", rate: 40 },
    { day: "Day 30", rate: 35 },
  ];

  const xpDistributionData: XpDistributionData[] = [
    { range: "0-100", count: 120 },
    { range: "101-500", count: 250 },
    { range: "501-1000", count: 180 },
    { range: "1001-5000", count: 95 },
    { range: "5001+", count: 35 },
  ];

  const dailyActiveUsersData = [
    { day: "Mon", users: 120 },
    { day: "Tue", users: 140 },
    { day: "Wed", users: 135 },
    { day: "Thu", users: 160 },
    { day: "Fri", users: 180 },
    { day: "Sat", users: 170 },
    { day: "Sun", users: 155 },
  ];

  // Colors for charts
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Render loading state
  if (isLoadingStats && isLoadingEvents) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto pb-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track user engagement and performance metrics
            </p>
          </div>
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading analytics data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track user engagement and performance metrics
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="alltime">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-blue-50 rounded-md p-3">
                        <FaUsers className="text-blue-500" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">
                          Active Users
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-slate-900">
                            {stats?.activeUsers?.toLocaleString() || "0"}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-green-50 rounded-md p-3">
                        <FaTrophy className="text-green-500" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">
                          XP Transactions
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-slate-900">
                            {stats?.xpTransactions?.toLocaleString() || "0"}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-amber-50 rounded-md p-3">
                        <FaCalendarAlt className="text-amber-500" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">
                          Active Campaigns
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-slate-900">
                            {stats?.activeCampaigns || "0"}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-purple-50 rounded-md p-3">
                        <FaWallet className="text-purple-500" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">
                          Rewards Distributed
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-slate-900">
                            {stats?.rewardsDistributed?.toLocaleString() || "0"} GAMI
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>XP Events Distribution</CardTitle>
                  <CardDescription>
                    Distribution of XP events by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={events}
                          dataKey="count"
                          nameKey="eventName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#6366f1"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {events.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Active Users</CardTitle>
                  <CardDescription>
                    Active users per day over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyActiveUsersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>XP Events by Amount</CardTitle>
                <CardDescription>
                  Comparison of XP awarded by event type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={events}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="eventName" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="avgXp" name="Average XP" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Heatmap</CardTitle>
                  <CardDescription>
                    User activity patterns by day and hour
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="text-center text-xs font-medium text-slate-500">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
                      </div>
                    ))}
                    {Array.from({ length: 24 * 7 }, (_, i) => (
                      <div
                        key={i}
                        className="h-4 rounded-sm"
                        style={{
                          backgroundColor: `rgba(99, 102, 241, ${Math.random() * 0.9 + 0.1})`,
                          opacity: Math.random() * 0.8 + 0.2,
                        }}
                        title={`${Math.floor((i % 24)).toString().padStart(2, "0")}:00 - ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][Math.floor(i / 24)]}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">Less activity</div>
                    <div className="flex items-center">
                      <div className="h-2 w-16 bg-gradient-to-r from-primary-100 to-primary-500 rounded"></div>
                    </div>
                    <div className="text-xs text-slate-500">More activity</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Active Users</CardTitle>
                  <CardDescription>
                    Top users by XP earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            {i + 1}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">User {Math.floor(Math.random() * 900) + 100}</div>
                            <div className="text-xs text-slate-500">
                              {Math.floor(Math.random() * 50) + 10} events triggered
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-bold">
                          {(Math.floor(Math.random() * 10000) + 1000).toLocaleString()} XP
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User XP Distribution</CardTitle>
                <CardDescription>
                  Distribution of users by XP earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={xpDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="count" name="Number of Users" fill="#6366f1">
                        {xpDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Rewards Distribution</CardTitle>
                  <CardDescription>
                    Total rewards distributed over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={[
                          { month: 'Jan', rewards: 5000 },
                          { month: 'Feb', rewards: 7500 },
                          { month: 'Mar', rewards: 10000 },
                          { month: 'Apr', rewards: 12500 },
                          { month: 'May', rewards: 15000 },
                          { month: 'Jun', rewards: 20000 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} GAMI`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="rewards" 
                          name="GAMI Tokens" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    Rewards distributed by campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { campaign: 'Summer Challenge', rewards: 8500, users: 350 },
                          { campaign: 'Early Adopter', rewards: 12000, users: 500 },
                          { campaign: 'Weekly Streak', rewards: 6000, users: 250 },
                          { campaign: 'Referral Program', rewards: 4500, users: 180 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="campaign" />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip formatter={(value: number, name) => 
                          name === 'rewards' 
                            ? `${value.toLocaleString()} GAMI` 
                            : value.toLocaleString()
                        } />
                        <Legend />
                        <Bar yAxisId="left" dataKey="rewards" name="GAMI Distributed" fill="#6366f1" />
                        <Bar yAxisId="right" dataKey="users" name="Active Users" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reward Distribution Status</CardTitle>
                <CardDescription>
                  Status of reward distributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: 75 },
                          { name: 'Pending', value: 20 },
                          { name: 'Failed', value: 5 },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#6366f1"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="retention">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>User Retention</CardTitle>
                  <CardDescription>
                    User retention rates over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userRetentionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          name="Retention Rate" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Metrics</CardTitle>
                  <CardDescription>
                    Average session duration and frequency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Average Session Duration</h4>
                      <div className="text-2xl font-bold">5m 32s</div>
                      <div className="h-2 bg-slate-100 rounded-full mt-2">
                        <div className="h-2 bg-primary-500 rounded-full w-[65%]"></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">+12% vs previous period</div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Sessions Per User</h4>
                      <div className="text-2xl font-bold">3.8</div>
                      <div className="h-2 bg-slate-100 rounded-full mt-2">
                        <div className="h-2 bg-primary-500 rounded-full w-[45%]"></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">+5% vs previous period</div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Daily Active Users / Monthly Active Users</h4>
                      <div className="text-2xl font-bold">35%</div>
                      <div className="h-2 bg-slate-100 rounded-full mt-2">
                        <div className="h-2 bg-primary-500 rounded-full w-[35%]"></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">+3% vs previous period</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Analysis</CardTitle>
                <CardDescription>
                  User retention by weekly cohort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] table-fixed">
                    <thead>
                      <tr>
                        <th className="w-20 p-2 text-left text-xs font-medium text-slate-500">Cohort</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Size</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Week 1</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Week 2</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Week 3</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Week 4</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Week 5</th>
                        <th className="w-16 p-2 text-center text-xs font-medium text-slate-500">Week 6</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }, (_, i) => {
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        
                        const formatDate = (date: Date) => 
                          `${date.getMonth() + 1}/${date.getDate()}`;
                        
                        const cohortLabel = `${formatDate(weekStart)}-${formatDate(weekEnd)}`;
                        const cohortSize = Math.floor(Math.random() * 500) + 300;
                        
                        return (
                          <tr key={i} className="border-b">
                            <td className="p-2 text-xs font-medium">{cohortLabel}</td>
                            <td className="p-2 text-center text-xs">{cohortSize}</td>
                            {Array.from({ length: 6 }, (_, j) => {
                              // Show N/A for future weeks
                              if (j > i) return <td key={j} className="p-2 text-center text-xs text-slate-400">-</td>;
                              
                              const retention = j === 0 
                                ? 100 
                                : Math.floor(Math.max(0, 100 - (j * (6 + Math.random() * 8))));
                              
                              return (
                                <td key={j} className="p-2">
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs mb-1">{retention}%</span>
                                    <div className="w-full h-2 bg-slate-100 rounded-full">
                                      <div 
                                        className="h-2 bg-primary-500 rounded-full"
                                        style={{ width: `${retention}%`, opacity: Math.max(0.2, retention / 100) }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
