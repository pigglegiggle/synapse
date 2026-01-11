import React from 'react';
import RuleConfig from '../components/RuleConfig';

const PoliciesPage = () => {
    return (
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
            {/* <h2 className="text-2xl font-bold mb-4">Policy Engine</h2> */}
            <RuleConfig />
        </div>
    );
};

export default PoliciesPage;
