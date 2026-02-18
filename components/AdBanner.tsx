import React from 'react';

interface AdBannerProps {
  type?: 'banner' | 'large';
}

export const AdBanner: React.FC<AdBannerProps> = ({ type = 'banner' }) => {
  const isBanner = type === 'banner';

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden ${isBanner ? 'h-16' : 'h-64 rounded-xl my-4'}`}>
      <div className="absolute top-1 right-1 text-[10px] text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-300 px-1 rounded border border-gray-300 dark:border-gray-600">
        Ad
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
        {isBanner ? 'Smart Shoes - Run Faster Today!' : 'Premium Protein Shake - 20% OFF'}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-600">
        Simulated AdMob {isBanner ? 'Banner' : 'Interstitial'}
      </p>
    </div>
  );
};