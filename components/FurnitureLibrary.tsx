
import React from 'react';
import { Translations } from '../localization';

interface FurnitureLibraryProps {
    furnitureFiles: File[];
    onFurnitureChange: (files: File[]) => void;
    t: Translations;
}

const FurnitureThumbnail: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setImageUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className="relative group aspect-square">
            <img src={imageUrl ?? ''} alt={file.name} className="w-full h-full object-cover rounded-md shadow-sm" />
            <button
                onClick={onRemove}
                className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove item"
            >
                &times;
            </button>
        </div>
    );
};


export const FurnitureLibrary: React.FC<FurnitureLibraryProps> = ({ furnitureFiles, onFurnitureChange, t }) => {

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            onFurnitureChange([...furnitureFiles, ...newFiles]);
            // Reset file input to allow re-uploading the same file
            e.target.value = '';
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        onFurnitureChange(furnitureFiles.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 h-full text-start sticky top-8">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{t.furnitureLibraryTitle}</h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {furnitureFiles.map((file, index) => (
                   <FurnitureThumbnail key={`${file.name}-${index}`} file={file} onRemove={() => handleRemoveFile(index)} />
                ))}
                <label htmlFor="furniture-upload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer text-gray-500 hover:text-indigo-600 hover:border-indigo-500 transition-colors">
                     <span className="text-3xl font-light">+</span>
                     <span className="text-xs text-center">{t.addFurnitureButton}</span>
                     <input id="furniture-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} multiple />
                </label>
            </div>
             {furnitureFiles.length === 0 && (
                 <p className="text-xs text-gray-500 mt-4 text-center">{t.furnitureLibraryHint}</p>
             )}
        </div>
    );
};
