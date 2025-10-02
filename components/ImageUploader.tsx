
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { Translations } from '../localization';

interface ImageUploaderProps {
    onImageChange: (file: File) => void;
    t: Translations;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, t }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageChange(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageChange(e.dataTransfer.files[0]);
        }
    }, [onImageChange]);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    return (
        <div className="w-full max-w-lg">
            <label
                htmlFor="file-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className={`w-10 h-10 mb-3 transition-colors duration-300 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t.uploaderTitle}</span> {t.uploaderSubtitle}</p>
                    <p className="text-xs text-gray-500">{t.uploaderHint}</p>
                </div>
                <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div>
    );
};
