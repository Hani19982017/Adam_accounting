import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  // Get transactions for current month
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { data: transactions = { income: [], expenses: [] }, isLoading, refetch } = trpc.transactions.getByMonth.useQuery(
    { month: monthKey },
    { enabled: isAuthenticated }
  );

  const addTransactionMutation = trpc.transactions.add.useMutation({
    onSuccess: () => {
      setAmount('');
      setDescription('');
      refetch();
      toast.success('تم إضافة العملية بنجاح');
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ');
    },
  });

  const deleteTransactionMutation = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('تم حذف العملية بنجاح');
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ');
    },
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    addTransactionMutation.mutate({
      type,
      amount: parseFloat(amount),
      description,
      month: monthKey,
    });
  };

  const handleDeleteTransaction = (id: number) => {
    deleteTransactionMutation.mutate({ id });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });

  const totalIncome = transactions.income.reduce((sum: number, t) => sum + parseFloat(t.amount as any), 0);
  const totalExpenses = transactions.expenses.reduce((sum: number, t) => sum + parseFloat(t.amount as any), 0);
  const net = totalIncome - totalExpenses;
  const savings = net * 0.2;
  const remaining = net - savings;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">تطبيق تتبع المصاريف والمداخيل</h1>
            <p className="text-slate-600">إدارة مصاريفك ومداخيلك بسهولة وحساب الربح التلقائي</p>
          </div>
          <a href={getLoginUrl()}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
              تسجيل الدخول
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">تطبيق تتبع المصاريف والمداخيل</h1>
            <p className="text-slate-600">مرحباً {user?.name}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="text-slate-600"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4 shadow-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(-1)}
            className="text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold text-slate-800">{monthName}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(1)}
            className="text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Income Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">المداخيل</span>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-green-700 font-mono">
              {totalIncome.toFixed(0)}
            </p>
          </Card>

          {/* Expenses Card */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">المصاريف</span>
              <span className="text-2xl">📉</span>
            </div>
            <p className="text-3xl font-bold text-red-700 font-mono">
              {totalExpenses.toFixed(0)}
            </p>
          </Card>

          {/* Net Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">الصافي</span>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-blue-700 font-mono">
              {net.toFixed(0)}
            </p>
          </Card>

          {/* Savings (20%) Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">الـ 20% (الادخار)</span>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-purple-700 font-mono">
              {savings.toFixed(0)}
            </p>
          </Card>
        </div>

        {/* Remaining After 20% */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">الباقي بعد خصم الـ 20%</p>
              <p className="text-3xl font-bold text-amber-600 font-mono">{remaining.toFixed(0)}</p>
            </div>
            <span className="text-4xl">✨</span>
          </div>
        </div>

        {/* Add Transaction Form */}
        <Card className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">إضافة عملية جديدة</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">النوع</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="income">مدخول</option>
                  <option value="expense">مصروف</option>
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
                <Input
                  type="text"
                  placeholder="مثال: دفع 200 حق موقع..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={addTransactionMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {addTransactionMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
            </Button>
          </form>
        </Card>

        {/* Transactions List */}
        <div className="space-y-6">
          {isLoading ? (
            <Card className="bg-white rounded-lg p-12 shadow-sm text-center">
              <p className="text-slate-500">جاري التحميل...</p>
            </Card>
          ) : (
            <>
              {/* Income Transactions */}
              {transactions.income.length > 0 && (
                <Card className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-green-700 mb-4">المداخيل</h3>
                  <div className="space-y-2">
                    {transactions.income.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{transaction.description}</p>
                          <p className="text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-green-700 font-mono">
                            +{parseFloat(transaction.amount).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deleteTransactionMutation.isPending}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Expense Transactions */}
              {transactions.expenses.length > 0 && (
                <Card className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-red-700 mb-4">المصاريف</h3>
                  <div className="space-y-2">
                    {transactions.expenses.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{transaction.description}</p>
                          <p className="text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-red-700 font-mono">
                            -{parseFloat(transaction.amount).toFixed(0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={deleteTransactionMutation.isPending}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Empty State */}
              {transactions.income.length === 0 && transactions.expenses.length === 0 && (
                <Card className="bg-white rounded-lg p-12 shadow-sm text-center">
                  <p className="text-slate-500 text-lg mb-2">لا توجد عمليات في هذا الشهر</p>
                  <p className="text-slate-400">ابدأ بإضافة أول مدخول أو مصروف</p>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
