    import React, { useState, useEffect } from 'react';
    import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

    function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [transactions, setTransactions] = useState([]);
    const [monthlyLimit, setMonthlyLimit] = useState(0);
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        comment: ''
    });

    const categories = {
        income: ['Зарплата', 'Фриланс', 'Инвестиции', 'Подарок', 'Другое'],
        expense: ['Еда', 'Транспорт', 'Развлечения', 'Жилье', 'Здоровье', 'Одежда', 'Другое']
    };


    useEffect(() => {
        const savedTransactions = localStorage.getItem('finance-transactions');
        const savedLimit = localStorage.getItem('finance-monthly-limit');
        
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedLimit) setMonthlyLimit(Number(savedLimit));
    }, []);


    useEffect(() => {
        localStorage.setItem('finance-transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('finance-monthly-limit', monthlyLimit.toString());
    }, [monthlyLimit]);

    const addTransaction = (e) => {
        e.preventDefault();
        if (!formData.category || !formData.amount) return;

        const newTransaction = {
        id: Date.now(),
        ...formData,
        amount: Number(formData.amount),
        date: new Date().toLocaleDateString('ru-RU'),
        timestamp: new Date().getTime()
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setFormData({ type: 'expense', category: '', amount: '', comment: '' });
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };


    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const remainingLimit = monthlyLimit - totalExpenses;

    const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

    const expenseByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
        const existing = acc.find(item => item.name === transaction.category);
        if (existing) {
            existing.value += transaction.amount;
        } else {
            acc.push({ name: transaction.category, value: transaction.amount });
        }
        return acc;
        }, []);

    const monthlyData = transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.timestamp).toLocaleDateString('ru-RU', { month: 'short' });
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
        if (transaction.type === 'income') {
            existing.income += transaction.amount;
        } else {
            existing.expenses += transaction.amount;
        }
        } else {
        acc.push({
            month,
            income: transaction.type === 'income' ? transaction.amount : 0,
            expenses: transaction.type === 'expense' ? transaction.amount : 0
        });
        }
        return acc;
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
        <div className="glass-container">
        <div className="glass-app">
            <div className="glass-header">
            <h1>ControlMe</h1>
            <p>Установи полный контроль своих финансов!</p>
            </div>

            <div className="glass-nav">
            <button 
                onClick={() => setCurrentPage('dashboard')}
                className={`nav-glass ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
                Моя доска
            </button>
            <button 
                onClick={() => setCurrentPage('analytics')}
                className={`nav-glass ${currentPage === 'analytics' ? 'active' : ''}`}
            >
                Аналитика
            </button>
            </div>

            <div className="glass-content">
            {currentPage === 'dashboard' && (
                <div className="dashboard-layout">
                <div className="sidebar">
                    <div className="glass-form">
                    <h2>Операций</h2>
                    <form onSubmit={addTransaction} className="glass-form-content">
                        <div className="form-group">
                        <label>Тип операции</label>
                        <select 
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                            className="glass-select"
                        >
                            <option value="income">Доход</option>
                            <option value="expense">Расход</option>
                        </select>
                        </div>

                        <div className="form-group">
                        <label>Категория</label>
                        <select 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            required
                            className="glass-select"
                        >
                            <option value="">Выберите категорию</option>
                            {categories[formData.type].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        </div>

                        <div className="form-group">
                        <label>Сумма (₸)</label>
                        <input 
                            type="number" 
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            placeholder="0"
                            required
                            className="glass-input"
                        />
                        </div>

                        <div className="form-group">
                        <label>Комментарий</label>
                        <input 
                            type="text" 
                            value={formData.comment}
                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                            placeholder="Описание операции..."
                            className="glass-input"
                        />
                        </div>

                        <button type="submit" className="glass-btn">
                        Добавить операцию
                        </button>
                    </form>
                    </div>

                    {/* Monthly Limit */}
                    <div className="glass-form">
                    <h2>Месячный лимит</h2>
                    <div className="limit-input-group">
                        <input 
                        type="number"
                        value={monthlyLimit || ''}
                        onChange={(e) => setMonthlyLimit(Number(e.target.value) || 0)}
                        placeholder="Установите лимит"
                        className="glass-input"
                        />
                        <span style={{ fontWeight: 'bold', color: 'white' }}>₸</span>
                    </div>
                    {monthlyLimit > 0 && (
                        <div className={`limit-display ${remainingLimit >= 0 ? 'positive' : 'negative'}`}>
                        {remainingLimit >= 0 ? '✅' : '⚠️'} 
                        <div>Осталось: {remainingLimit} ₸</div>
                        </div>
                    )}
                    </div>
                </div>

                <div className="main-content">
                    <div className="summary-grid">
                    <div className="summary-glass income">
                        <div className="summary-label">ДОХОДЫ</div>
                        <div className="summary-value positive">+{totalIncome} ₸</div>
                    </div>
                    
                    <div className="summary-glass expense">
                        <div className="summary-label">РАСХОДЫ</div>
                        <div className="summary-value negative">-{totalExpenses} ₸</div>
                    </div>
                    
                    <div className="summary-glass balance">
                        <div className="summary-label">БАЛАНС</div>
                        <div className={`summary-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {balance} ₸
                        </div>
                    </div>
                    </div>

                    <div className="glass-card">
                    <h2>История операций</h2>
                    
                    {sortedTransactions.length === 0 ? (
                        <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <h3>Операций пока нет</h3>
                        <p>Добавьте первую операцию чтобы начать отслеживать финансы</p>
                        </div>
                    ) : (
                        <div className="transaction-list">
                        {sortedTransactions.map(transaction => (
                            <div 
                            key={transaction.id} 
                            className={`transaction-glass ${transaction.type}`}
                            >
                            <div className="transaction-info">
                                <div className="transaction-category">
                                {transaction.category}
                                </div>
                                {transaction.comment && (
                                <div className="transaction-comment">
                                    {transaction.comment}
                                </div>
                                )}
                                <div className="transaction-date">
                                {transaction.date}
                                </div>
                            </div>
                            
                            <div className="transaction-actions">
                                <div className={`transaction-amount ${transaction.type}`}>
                                {transaction.type === 'income' ? '+' : '-'}{transaction.amount} ₸
                                </div>
                                
                                <button 
                                onClick={() => deleteTransaction(transaction.id)}
                                className="action-btn delete-btn"
                                >
                                🗑️
                                </button>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}                    </div>
                </div>
                </div>
            )}

            {currentPage === 'analytics' && (
                <div className="analytics-page">
                <h2>Аналитика финансов</h2>
                
                {transactions.length === 0 ? (
                    <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>Нет данных для анализа</h3>
                    <p>Добавьте несколько операций чтобы увидеть графики</p>
                    </div>
                ) : (
                    <div className="analytics-grid">
                    {expenseByCategory.length > 0 && (
                        <div className="glass-card">
                        <h3>Расходы по категориям</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                            <Pie
                                data={expenseByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {expenseByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} ₸`, 'Сумма']} />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>
                    )}

                    {monthlyData.length > 0 && (
                        <div className="glass-card">
                        <h3>Доходы и расходы по месяцам</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} ₸`, 'Сумма']} />
                            <Legend />
                            <Bar dataKey="income" fill="#82ca9d" name="Доходы" />
                            <Bar dataKey="expenses" fill="#8884d8" name="Расходы" />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="glass-card">
                        <h4>Общая статистика</h4>
                        <div className="stats-list">
                            <div className="stat-item">
                            <span>Всего операций:</span>
                            <strong>{transactions.length}</strong>
                            </div>
                            <div className="stat-item">
                            <span>Доходы:</span>
                            <strong className="positive">{totalIncome} ₸</strong>
                            </div>
                            <div className="stat-item">
                            <span>Расходы:</span>
                            <strong className="negative">{totalExpenses} ₸</strong>
                            </div>
                            <div className="stat-item">
                            <span>Баланс:</span>
                            <strong className={balance >= 0 ? 'positive' : 'negative'}>
                                {balance} ₸
                            </strong>
                            </div>
                        </div>
                        </div>

                        <div className="glass-card">
                        <h4>Прогресс по лимиту</h4>
                        {monthlyLimit > 0 ? (
                            <div className="limit-progress">
                            <div className="stat-item">
                                <span>Лимит:</span>
                                <strong>{monthlyLimit} ₸</strong>
                            </div>
                            <div className="stat-item">
                                <span>Потрачено:</span>
                                <strong className="negative">{totalExpenses} ₸</strong>
                            </div>
                            <div className="stat-item">
                                <span>Остаток:</span>
                                <strong className={remainingLimit >= 0 ? 'positive' : 'negative'}>
                                {remainingLimit} ₸
                                </strong>
                            </div>
                            <div className="progress-bar">
                                <div 
                                className={`progress-fill ${remainingLimit >= 0 ? 'positive' : 'negative'}`}
                                style={{ width: `${Math.min((totalExpenses / monthlyLimit) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="progress-text">
                                {Math.min((totalExpenses / monthlyLimit) * 100, 100).toFixed(1)}% использовано
                            </div>
                            </div>
                        ) : (
                            <p className="no-limit">Лимит не установлен</p>
                        )}
                        </div>
                    </div>
                    </div>
                )}
                </div>
            )}
            </div>
        </div>
            <div className="particles-container">
                {[...Array(15)].map((_, i) => (
                <div key={i} className="particle" />
                ))}
            </div>
            );
        </div>
    );
    }

    export default App;