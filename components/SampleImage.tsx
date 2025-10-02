
import React from 'react';
import { Translations } from '../localization';

interface SampleImageProps {
    onSampleSelect: () => void;
    t: Translations;
}

export const SampleImage: React.FC<SampleImageProps> = ({ onSampleSelect, t }) => {
    return (
        <button
            onClick={onSampleSelect}
            className="group relative w-full max-w-lg bg-gray-700 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <img src="https://picsum.photos/seed/interior/1024/768" alt="Sample empty room" className="w-full h-32 object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-white font-semibold text-lg">{t.sampleTitle}</p>
                <p className="text-white text-sm bg-black bg-opacity-40 px-3 py-1 rounded-md">{t.sampleButton}</p>
            </div>
        </button>
    );
}
