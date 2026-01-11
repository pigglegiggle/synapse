import React from 'react';
import ModelExplainer from '../components/ModelExplainer';

const MLExplainerPage = () => {
    return (
        <div className="flex-1 h-screen overflow-y-auto bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-8 py-5">
                <h1 className="text-2xl font-bold text-gray-900">Machine Learning Logic</h1>
                <p className="text-sm text-gray-500 mt-1">Under the hood of Synapse's fraud detection engine</p>
            </header>
            <ModelExplainer />
        </div>
    );
};

export default MLExplainerPage;
