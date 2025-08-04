/**
 * Admin Dashboard - Desktop-mode only
 * Separate interface for system administration
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Activity, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Shield,
  Settings,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Ban,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AdminService } from '../services/AdminService.ts';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Check if this is desktop mode
  const isDesktop = window.innerWidth >= 1024;

  useEffect(() => {
    if (!isDesktop) {
      toast.error('Admin dashboard is only available on desktop');
      return;
    }
    loadAdminData();
  }, [isDesktop]);

  const loadAdminData = async () => {
    if (!isDesktop) return;
    
    setIsLoading(true);
    try {
      const [health, userList, transactionList, stats] = await Promise.all([
        AdminService.getSystemHealth(),
        AdminService.getUsers(),
        AdminService.getTransactions(),
        AdminService.getSystemStats()
      ]);

      setSystemHealth(health);
      setUsers(userList);
      setTransactions(transactionList);
      setSystemStats(stats);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'view') => {
    try {
      switch (action) {
        case 'suspend':
          await AdminService.suspendUser(userId);
          toast.success('User suspended successfully');
          break;
        case 'activate':
          await AdminService.activateUser(userId);
          toast.success('User activated successfully');
          break;
        case 'view':
          // Navigate to user details
          break;
      }
      loadAdminData();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const exportData = (type: 'users' | 'transactions' | 'system') => {
    let data;
    let filename;
    
    switch (type) {
      case 'users':
        data = users;
        filename = 'users-export';
        break;
      case 'transactions':
        data = transactions;
        filename = 'transactions-export';
        break;
      case 'system':
        data = { systemHealth, systemStats };
        filename = 'system-export';
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${type} data exported successfully`);
  };

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Desktop Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The admin dashboard is only available on desktop devices for security and usability reasons.
          </p>
          <Button onClick={onLogout} className="bg-blue-600 hover:bg-blue-700 text-white">
            Return to Main App
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              CrossBridge Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              System administration and monitoring
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => loadAdminData()}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </Button>
            
            <Button
              onClick={onLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - System Health */}
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            System Health
          </h3>
          
          {systemHealth && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    API Status
                  </span>
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  All systems operational
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Database
                  </span>
                  <Database size={16} className="text-blue-600" />
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Connection: {systemHealth.database?.status || 'Healthy'}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Payment Processors
                  </span>
                  <CreditCard size={16} className="text-purple-600" />
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  {systemHealth.payments?.active || 3} active
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {systemStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStats.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +{systemStats.newUsersToday || 0} today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${(systemStats.totalVolume || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +{systemStats.volumeGrowth || 0}% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStats.activeTransactions || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {systemStats.pendingTransactions || 0} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                      <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStats.uptime || '99.9%'}</div>
                      <p className="text-xs text-muted-foreground">
                        Last 30 days
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={() => exportData('users')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Export</span>
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(user => 
                      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {user.name?.[0] || 'U'}
                              </span>
                            </div>
                            <span>{user.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>${(user.balance || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUserAction(user.id, 'view')}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                              className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                            >
                              {user.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Button
                  onClick={() => exportData('transactions')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Export</span>
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{transaction.user?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {transaction.currency} {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield size={20} className="mr-2" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>SSL Certificate</span>
                      <Badge variant="default">Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Rate Limiting</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fraud Detection</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings size={20} className="mr-2" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => exportData('system')}
                      className="w-full"
                      variant="outline"
                    >
                      Export System Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
