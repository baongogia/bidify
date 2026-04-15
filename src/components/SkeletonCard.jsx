import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 w-full"></div>
            <div className="p-3.5 sm:p-4 space-y-2">
                <div className="h-2.5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3.5 bg-gray-200 rounded w-[90%]"></div>
                <div className="h-3.5 bg-gray-200 rounded w-2/3"></div>
                <div className="pt-2 border-t border-gray-100">
                    <div className="h-5 bg-gray-300 rounded w-2/5"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
