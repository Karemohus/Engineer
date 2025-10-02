
import React from 'react';
import { Translations } from '../localization';

interface DimensionInputProps {
    length: string;
    onLengthChange: (value: string) => void;
    width: string;
    onWidthChange: (value: string) => void;
    height: string;
    onHeightChange: (value: string) => void;
    isEstimating: boolean;
    t: Translations;
}

export const DimensionInput: React.FC<DimensionInputProps> = ({ length, onLengthChange, width, onWidthChange, height, onHeightChange, isEstimating, t }) => {
    return (
        <div className="space-y-4 text-start">
            <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-semibold text-gray-600">{t.dimensionsTitleOptional}</label>
                {isEstimating && (
                    <div className="flex items-center gap-2" aria-live="polite">
                        <div className="w-4 h-4 border-2 border-t-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-500">{t.estimating}</span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="length" className="block text-xs text-gray-500 mb-1">{t.length}</label>
                    <input
                        type="text"
                        id="length"
                        value={length}
                        onChange={(e) => onLengthChange(e.target.value)}
                        placeholder={t.lengthPlaceholder}
                        disabled={isEstimating}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm disabled:bg-gray-100 disabled:cursor-wait"
                    />
                </div>
                <div>
                    <label htmlFor="width" className="block text-xs text-gray-500 mb-1">{t.width}</label>
                    <input
                        type="text"
                        id="width"
                        value={width}
                        onChange={(e) => onWidthChange(e.target.value)}
                        placeholder={t.widthPlaceholder}
                        disabled={isEstimating}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm disabled:bg-gray-100 disabled:cursor-wait"
                    />
                </div>
                <div>
                    <label htmlFor="height" className="block text-xs text-gray-500 mb-1">{t.height}</label>
                    <input
                        type="text"
                        id="height"
                        value={height}
                        onChange={(e) => onHeightChange(e.target.value)}
                        placeholder={t.heightPlaceholder}
                        disabled={isEstimating}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm disabled:bg-gray-100 disabled:cursor-wait"
                    />
                </div>
            </div>
        </div>
    );
};
