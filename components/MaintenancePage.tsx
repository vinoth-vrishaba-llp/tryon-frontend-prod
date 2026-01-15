import React from 'react';

const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">System Maintenance</h1>
                <p className="text-gray-600 mb-8">
                    We are currently performing scheduled maintenance to improve our services. We'll be back online shortly. Thank you for your patience!
                </p>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm font-medium">
                    Estimated downtime: 30-60 minutes
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
