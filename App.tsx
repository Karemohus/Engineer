
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { Loader } from './components/Loader';
import { analyzeImage, visualizeDesign, estimateDimensions, generateImageView } from './services/geminiService';
import type { DesignAnalysis } from './types';
import { SampleImage } from './components/SampleImage';
import { DesignCustomizer } from './components/DesignCustomizer';
import { DimensionInput } from './components/DimensionInput';
import { translations, Language } from './localization';
import { FurnitureLibrary } from './components/FurnitureLibrary';

const App: React.FC = () => {
    const [lang, setLang] = useState<Language>('en');
    const t = translations[lang];

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    
    const [generated3dUrl, setGenerated3dUrl] = useState<string | null>(null);
    const [isGenerating3d, setIsGenerating3d] = useState<boolean>(false);
    const [generation3dError, setGeneration3dError] = useState<string | null>(null);

    const [generated2dUrl, setGenerated2dUrl] = useState<string | null>(null);
    const [isGenerating2d, setIsGenerating2d] = useState<boolean>(false);
    const [generation2dError, setGeneration2dError] = useState<string | null>(null);

    const [selectedStyle, setSelectedStyle] = useState<string>('AI Suggests');
    const [customFurniture, setCustomFurniture] = useState<string>('');
    const [redesignInstructions, setRedesignInstructions] = useState<string>('');
    const [furnitureFiles, setFurnitureFiles] = useState<File[]>([]);
    const [length, setLength] = useState<string>('');
    const [width, setWidth] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [isEstimatingDims, setIsEstimatingDims] = useState<boolean>(false);
    const [showDimensions, setShowDimensions] = useState<boolean>(false);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);

    useEffect(() => {
        if (imageFile) {
            const objectUrl = URL.createObjectURL(imageFile);
            setImageUrl(objectUrl);
            
            // Auto-estimate dimensions
            const getDimensions = async () => {
                setIsEstimatingDims(true);
                // Clear previous dimensions
                setLength('');
                setWidth('');
                setHeight('');
                try {
                    const dims = await estimateDimensions(imageFile);
                    setLength(dims.length || '');
                    setWidth(dims.width || '');
                    setHeight(dims.height || '');
                } catch (err) {
                    console.error("Failed to auto-estimate dimensions:", err);
                    // Silently fail, user can input manually
                } finally {
                    setIsEstimatingDims(false);
                }
            };
            getDimensions();

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [imageFile]);

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile) {
            setError(t.uploadError);
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setGeneratedImageUrl(null);
        setGenerationError(null);
        setGenerated3dUrl(null);
        setGeneration3dError(null);
        setGenerated2dUrl(null);
        setGeneration2dError(null);

        try {
            const result = await analyzeImage(imageFile, furnitureFiles, selectedStyle, customFurniture, redesignInstructions, length, width, height, lang);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : t.analysisError);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, furnitureFiles, selectedStyle, customFurniture, redesignInstructions, length, width, height, lang, t]);

    const handleVisualizeClick = useCallback(async () => {
        if (!analysis?.aiImagePrompts?.photorealistic) {
            setGenerationError(t.generationError);
            return;
        }
        if (!imageFile) {
            setGenerationError(t.missingImageError);
            return;
        }
        setIsGeneratingImage(true);
        setGenerationError(null);
        setGeneratedImageUrl(null);

        try {
            const base64Image = await visualizeDesign(imageFile, furnitureFiles, analysis.aiImagePrompts.photorealistic);
            setGeneratedImageUrl(`data:image/png;base64,${base64Image}`);
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : t.imageGenError);
        } finally {
            setIsGeneratingImage(false);
        }
    }, [analysis, imageFile, furnitureFiles, t]);

    const handleGenerate3d = useCallback(async () => {
        if (!analysis?.aiImagePrompts?.threeD) {
            setGeneration3dError(t.generationError);
            return;
        }
        setIsGenerating3d(true);
        setGeneration3dError(null);
        setGenerated3dUrl(null);
        try {
            const base64Image = await generateImageView(analysis.aiImagePrompts.threeD);
            setGenerated3dUrl(`data:image/jpeg;base64,${base64Image}`);
        } catch (err) {
            setGeneration3dError(err instanceof Error ? err.message : t.imageGenError);
        } finally {
            setIsGenerating3d(false);
        }
    }, [analysis, t]);

    const handleGenerate2d = useCallback(async () => {
        if (!analysis?.aiImagePrompts?.twoD) {
            setGeneration2dError(t.generationError);
            return;
        }
        setIsGenerating2d(true);
        setGeneration2dError(null);
        setGenerated2dUrl(null);
        try {
            const base64Image = await generateImageView(analysis.aiImagePrompts.twoD);
            setGenerated2dUrl(`data:image/jpeg;base64,${base64Image}`);
        } catch (err) {
            setGeneration2dError(err instanceof Error ? err.message : t.imageGenError);
        } finally {
            setIsGenerating2d(false);
        }
    }, [analysis, t]);

    const resetState = useCallback(() => {
        setImageFile(null);
        setImageUrl(null);
        setAnalysis(null);
        setIsLoading(false);
        setError(null);
        setGeneratedImageUrl(null);
        setIsGeneratingImage(false);
        setGenerationError(null);
        setGenerated3dUrl(null);
        setIsGenerating3d(false);
        setGeneration3dError(null);
        setGenerated2dUrl(null);
        setIsGenerating2d(false);
        setGeneration2dError(null);
        setSelectedStyle('AI Suggests');
        setCustomFurniture('');
        setRedesignInstructions('');
        setFurnitureFiles([]);
        setLength('');
        setWidth('');
        setHeight('');
        setShowDimensions(false);
    }, []);

    const handleSampleSelect = async () => {
        setIsLoading(true);
        const sampleUrl = "https://picsum.photos/seed/interior/1024/768";
        try {
            const response = await fetch(sampleUrl);
            const blob = await response.blob();
            const file = new File([blob], "sample-room.jpg", { type: "image/jpeg" });
            setImageFile(file);
        } catch (err) {
            setError(t.sampleImageError);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            {isLoading && <Loader t={t}/>}
            <div className="min-h-screen flex flex-col">
                <Header t={t} setLang={setLang} lang={lang} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <div className={`grid grid-cols-1 ${!analysis ? 'lg:grid-cols-3' : ''} gap-8`}>
                        <div className={!analysis ? "lg:col-span-2" : "max-w-4xl mx-auto w-full"}>
                             {!analysis && (
                                <div className="max-w-2xl mx-auto animate-fade-in">
                                    {!imageUrl ? (
                                        <>
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-bold text-gray-800">{t.transformTitle}</h2>
                                                <p className="text-gray-500 mt-2">{t.transformSubtitle}</p>
                                            </div>
                                            <div className="space-y-4 flex flex-col items-center">
                                                <ImageUploader onImageChange={setImageFile} t={t} />
                                                <span className="text-gray-500 text-sm">{t.uploaderSubtitle.split(' ')[0]}</span>
                                                <SampleImage onSampleSelect={handleSampleSelect} t={t}/>
                                            </div>
                                            <div className="mt-8 bg-white rounded-lg shadow p-6">
                                                <DesignCustomizer
                                                    selectedStyle={selectedStyle}
                                                    onStyleChange={setSelectedStyle}
                                                    customFurniture={customFurniture}
                                                    onFurnitureChange={setCustomFurniture}
                                                    redesignInstructions={redesignInstructions}
                                                    onRedesignInstructionsChange={setRedesignInstructions}
                                                    t={t}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="relative">
                                                <img src={imageUrl} alt="Uploaded room" className="rounded-lg w-full h-auto shadow-md" />
                                                <button onClick={() => { setImageFile(null); setImageUrl(null); setShowDimensions(false);}} className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors">&times;</button>
                                            </div>
                                            {showDimensions ? (
                                                <>
                                                    <div className="bg-white rounded-lg shadow p-6">
                                                        <DimensionInput
                                                            length={length}
                                                            onLengthChange={setLength}
                                                            width={width}
                                                            onWidthChange={setWidth}
                                                            height={height}
                                                            onHeightChange={setHeight}
                                                            isEstimating={isEstimatingDims}
                                                            t={t}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button 
                                                            onClick={() => setShowDimensions(false)}
                                                            className="text-gray-700 bg-gray-200 font-semibold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors"
                                                        >
                                                            {t.backButton}
                                                        </button>
                                                        <button 
                                                            onClick={handleAnalyzeClick} 
                                                            disabled={isEstimatingDims}
                                                            className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-300 disabled:cursor-wait"
                                                        >
                                                            {t.analyzeButton}
                                                        </button>
                                                    </div>
                                                    {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                                                </>
                                            ) : (
                                                <>
                                                     <div className="bg-white rounded-lg shadow p-6">
                                                        <DesignCustomizer
                                                            selectedStyle={selectedStyle}
                                                            onStyleChange={setSelectedStyle}
                                                            customFurniture={customFurniture}
                                                            onFurnitureChange={setCustomFurniture}
                                                            redesignInstructions={redesignInstructions}
                                                            onRedesignInstructionsChange={setRedesignInstructions}
                                                            t={t}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button 
                                                            onClick={() => setShowDimensions(true)} 
                                                            className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                                                        >
                                                            {t.nextButton}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {analysis && (
                                <div className="max-w-4xl mx-auto">
                                    <AnalysisResult
                                        analysis={analysis}
                                        onVisualize={handleVisualizeClick}
                                        isGeneratingImage={isGeneratingImage}
                                        generatedImageUrl={generatedImageUrl}
                                        generationError={generationError}
                                        onGenerate3d={handleGenerate3d}
                                        isGenerating3d={isGenerating3d}
                                        generated3dUrl={generated3dUrl}
                                        generation3dError={generation3dError}
                                        onGenerate2d={handleGenerate2d}
                                        isGenerating2d={isGenerating2d}
                                        generated2dUrl={generated2dUrl}
                                        generation2dError={generation2dError}
                                        t={t}
                                    />
                                    <div className="mt-8 text-center">
                                        <button onClick={resetState} className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                                            {t.startOverButton}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!analysis && (
                            <div className="lg:col-span-1">
                                <FurnitureLibrary
                                    furnitureFiles={furnitureFiles}
                                    onFurnitureChange={setFurnitureFiles}
                                    t={t}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;
