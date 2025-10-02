
import React from 'react';
import { Translations } from '../localization';

interface DesignCustomizerProps {
    selectedStyle: string;
    onStyleChange: (style: string) => void;
    customFurniture: string;
    onFurnitureChange: (furniture: string) => void;
    redesignInstructions: string;
    onRedesignInstructionsChange: (instructions: string) => void;
    t: Translations;
}

const styles = ['AI Suggests', 'Modern', 'Classic', 'Minimalist'] as const;

export const DesignCustomizer: React.FC<DesignCustomizerProps> = ({ 
    selectedStyle, 
    onStyleChange, 
    customFurniture, 
    onFurnitureChange,
    redesignInstructions,
    onRedesignInstructionsChange,
    t 
}) => {
    return (
        <div className="space-y-4 text-start">
            <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">{t.designStyleTitle}</label>
                <div className="flex flex-wrap gap-2">
                    {styles.map(style => (
                        <button
                            key={style}
                            type="button"
                            onClick={() => onStyleChange(style)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                                selectedStyle === style
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t.styles[style]}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <label htmlFor="redesign-instructions" className="block text-sm font-semibold text-gray-600 mb-2">
                    {t.redesignInstructionsTitle}
                </label>
                <textarea
                    id="redesign-instructions"
                    value={redesignInstructions}
                    onChange={(e) => onRedesignInstructionsChange(e.target.value)}
                    placeholder={t.redesignInstructionsPlaceholder}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                />
            </div>
            <div>
                 <label htmlFor="custom-furniture" className="block text-sm font-semibold text-gray-600 mb-2">
                    {t.customItemsTitle}
                </label>
                <textarea
                    id="custom-furniture"
                    value={customFurniture}
                    onChange={(e) => onFurnitureChange(e.target.value)}
                    placeholder={t.customItemsPlaceholder}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                />
            </div>
        </div>
    );
};
