import React from 'react';
import TestBench from '../components/TestBench';
import { Database } from 'lucide-react';

const TransactionsPage = () => {
    return (
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
            {/* <h2 className="text-2xl font-bold mb-4">Transaction Explorer</h2> */}
            <TestBench />
        </div>
    );
};

export default TransactionsPage;
