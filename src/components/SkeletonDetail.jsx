import React from 'react';

const SkeletonDetail = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left col */}
                <div className="space-y-4">
                    <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
                    <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
                {/* Right col */}
                <div className="space-y-6 pt-4">
                    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="py-4 border-y border-gray-100 space-y-4">
                        <div className="h-10 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-4 p-6 border border-gray-100 bg-gray-50 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                        <div className="h-12 bg-gray-200 rounded w-full"></div>
                        <div className="h-12 bg-blue-100 rounded w-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonDetail;
