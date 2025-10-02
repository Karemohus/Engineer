import React, { useState, useEffect } from 'react';
import type { DesignAnalysis, DesignStyle } from '../types';
import { Translations } from '../localization';

type ViewType = 'photorealistic' | '3d' | '2d';

interface AnalysisResultProps {
    analysis: DesignAnalysis;
    onVisualize: () => void;
    isGeneratingImage: boolean;
    generatedImageUrl: string | null;
    generationError: string | null;
    onGenerate3d: () => void;
    isGenerating3d: boolean;
    generated3dUrl: string | null;
    generation3dError: string | null;
    onGenerate2d: () => void;
    isGenerating2d: boolean;
    generated2dUrl: string | null;
    generation2dError: string | null;
    t: Translations;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

const Pill: React.FC<{ text: string }> = ({ text }) => (
    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium me-2 mb-2 px-2.5 py-1 rounded-full">{text}</span>
);

const StyleAccordion: React.FC<{ style: DesignStyle, t: Translations }> = ({ style, t }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-start py-4 px-1"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-indigo-700">{style.styleName}</span>
                <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`overflow-hidden transition-max-height duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="pb-4 px-1 text-gray-600 space-y-4">
                    <p className="italic">{style.description}</p>
                    <div>
                        <h5 className="font-semibold text-sm mb-1">{t.styleColorPalette}</h5>
                        <div className="flex flex-wrap">{style.colorPalette.map(c => <Pill key={c} text={c} />)}</div>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm mb-1">{t.styleKeyFurniture}</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {style.keyFurniture.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm mb-1">{t.styleDecor}</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {style.decor.map(d => <li key={d}>{d}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm mb-1">{t.styleMaterials}</h5>
                        <div className="flex flex-wrap">{style.materials.map(m => <Pill key={m} text={m} />)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VisualizationLoader: React.FC<{ t: Translations }> = ({ t }) => {
    const [message, setMessage] = useState(t.vizLoaderMessages[0]);

    useEffect(() => {
        const generationMessages = t.vizLoaderMessages;
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = generationMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % generationMessages.length;
                return generationMessages[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, [t]);

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 h-64">
             <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium transition-opacity duration-500">{message}</p>
        </div>
    );
};


export const AnalysisResult: React.FC<AnalysisResultProps> = (props) => {
    const { analysis, onVisualize, isGeneratingImage, generatedImageUrl, generationError,
            onGenerate2d, isGenerating2d, generated2dUrl, generation2dError,
            onGenerate3d, isGenerating3d, generated3dUrl, generation3dError, t
    } = props;
    const { imageAnalysis, designStyles, redesignConcept, dimensions, aiImagePrompts, arabicSummary } = analysis;
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<ViewType>('photorealistic');

    const userDimensions = dimensions.userProvidedDimensions;
    const hasUserDimensions = userDimensions && (userDimensions.length || userDimensions.width || userDimensions.height);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedPrompt(text);
            setTimeout(() => setCopiedPrompt(null), 2000);
        });
    };

    const handleTabClick = (view: ViewType) => {
        setActiveView(view);
        if (view === '3d' && !generated3dUrl && !isGenerating3d) {
            onGenerate3d();
        }
        if (view === '2d' && !generated2dUrl && !isGenerating2d) {
            onGenerate2d();
        }
    }

    const TABS: { [key in ViewType]: string } = {
        photorealistic: t.photorealisticView,
        '3d': t.threeDView,
        '2d': t.twoDView,
    };

    const renderViewContent = () => {
        const downloadButton = (url: string, filename: string) => (
            <a
                href={url}
                download={filename}
                className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 bg-black bg-opacity-60 text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-2"
                aria-label={t.downloadButton}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>{t.downloadButton}</span>
            </a>
        );

        switch (activeView) {
            case 'photorealistic':
                if (isGeneratingImage) return <VisualizationLoader t={t} />;
                if (generatedImageUrl) return (
                    <div className="relative">
                        <img src={generatedImageUrl} alt={t.altTextGeneratedDesign} className="rounded-lg w-full h-auto shadow-md animate-fade-in" />
                        {downloadButton(generatedImageUrl, 'redesigned-room.png')}
                    </div>
                );
                if (generationError) return <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-center"><p>{generationError}</p></div>;
                return null;
            case '3d':
                if (isGenerating3d) return <VisualizationLoader t={t} />;
                if (generated3dUrl) return (
                    <div className="relative">
                        <img src={generated3dUrl} alt={t.altText3dRender} className="rounded-lg w-full h-auto shadow-md animate-fade-in" />
                        {downloadButton(generated3dUrl, '3d-render.jpeg')}
                    </div>
                );
                if (generation3dError) return <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-center"><p>{generation3dError}</p></div>;
                return null;
            case '2d':
                if (isGenerating2d) return <VisualizationLoader t={t} />;
                if (generated2dUrl) return (
                     <div className="relative">
                        <img src={generated2dUrl} alt={t.altText2dPlan} className="rounded-lg w-full h-auto shadow-md animate-fade-in" />
                        {downloadButton(generated2dUrl, '2d-floor-plan.jpeg')}
                    </div>
                );
                if (generation2dError) return <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-center"><p>{generation2dError}</p></div>;
                return null;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">{t.reportTitle}</h2>
                <p className="text-gray-500 mt-2">{t.reportSubtitle}</p>
            </div>

            {arabicSummary && (
                 <div dir={document.documentElement.lang === 'ar' ? 'ltr' : 'rtl'} className="bg-white rounded-lg shadow p-6 text-start">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">{arabicSummary.title}</h3>
                    <p className="text-gray-600">{arabicSummary.concept}</p>
                </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
                <InfoCard title={t.initialAnalysisTitle}>
                    <p><strong>{t.roomType}</strong> {imageAnalysis.roomType}</p>
                    <p><strong>{t.lighting}</strong> {imageAnalysis.lighting}</p>
                    {imageAnalysis.features && imageAnalysis.features.length > 0 && (
                        <div className="mt-2">
                            <p><strong>{t.features}</strong></p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {imageAnalysis.features.map(f => <li key={f}>{f}</li>)}
                            </ul>
                        </div>
                    )}
                    {imageAnalysis.detectedFurniture && imageAnalysis.detectedFurniture.length > 0 && (
                        <div className="mt-2">
                            <p><strong>{t.detectedFurnitureTitle}</strong></p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {imageAnalysis.detectedFurniture.map(f => <li key={f}>{f}</li>)}
                            </ul>
                        </div>
                    )}
                </InfoCard>

                <InfoCard title={t.dimensionsTitle}>
                    {hasUserDimensions && (
                        <div className="mb-3 pb-3 border-b border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-600 mb-1">{t.providedDimensions}</h4>
                            <p className="text-sm"><strong>{t.providedLength}</strong> {userDimensions.length || 'N/A'}</p>
                            <p className="text-sm"><strong>{t.providedWidth}</strong> {userDimensions.width || 'N/A'}</p>
                            <p className="text-sm"><strong>{t.providedHeight}</strong> {userDimensions.height || 'N/A'}</p>
                        </div>
                    )}
                     <p><strong>{t.calculatedArea}</strong> {dimensions.estimatedArea}</p>
                     <p><strong>{t.calculatedVolume}</strong> {dimensions.estimatedVolume}</p>
                     <p className="text-xs text-gray-400 mt-2">{t.disclaimer}</p>
                </InfoCard>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">{redesignConcept.title}</h3>
                {redesignConcept.summaryOfChanges && (
                    <div className="mb-4 p-4 bg-indigo-50 rounded-lg text-start">
                        <h4 className="font-semibold text-indigo-800">{t.summaryOfChangesTitle}</h4>
                        <p className="text-indigo-700 text-sm">{redesignConcept.summaryOfChanges}</p>
                    </div>
                )}
                <div className="space-y-4 text-gray-600">
                    <div>
                        <h4 className="font-semibold text-gray-800">{t.spatialLayout}</h4>
                        <p>{redesignConcept.layout}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">{t.detailsFurnishing}</h4>
                        <p>{redesignConcept.details}</p>
                    </div>
                </div>
            </div>

            <InfoCard title={t.furnitureAndDecorTitle}>
                <ul className="space-y-3">
                    {redesignConcept.suggestedFurniture.map(item => (
                        <li key={item.name} className="flex flex-col sm:flex-row">
                            <strong className="sm:w-1/3 text-gray-800">{item.name}</strong>
                            <p className="sm:w-2/3 text-gray-600">{item.description}</p>
                        </li>
                    ))}
                </ul>
            </InfoCard>

             <div className="bg-white rounded-lg shadow p-6">
                 <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">{t.visualizationTitle}</h3>

                 {!generatedImageUrl && !isGeneratingImage ? (
                     <div className="text-center">
                         <p className="text-gray-600 mb-4">{t.visualizationReady}</p>
                         <button
                            onClick={onVisualize}
                            disabled={isGeneratingImage}
                            className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                         >
                            {t.visualizeButton}
                         </button>
                         {generationError && (
                            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-center">
                                <p>{generationError}</p>
                            </div>
                        )}
                     </div>
                 ) : (
                    <>
                        <div className="border-b border-gray-200">
                             <nav className="-mb-px flex space-x-4 sm:space-x-8 justify-center" aria-label="Tabs">
                                {(Object.keys(TABS) as ViewType[]).map((tabKey) => (
                                    <button
                                        key={tabKey}
                                        onClick={() => handleTabClick(tabKey)}
                                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeView === tabKey
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                        aria-current={activeView === tabKey ? 'page' : undefined}
                                    >
                                        {TABS[tabKey]}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="mt-6 min-h-[200px]">
                            {renderViewContent()}
                        </div>
                    </>
                 )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-2">{t.suggestedStyles}</h3>
                <div className="space-y-2">
                    {designStyles.map((style, index) => <StyleAccordion key={index} style={style} t={t} />)}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{t.aiPrompt}</h3>
                 <p className="text-xs text-gray-500 mb-3">{t.aiPromptHint}</p>
                 <div className="space-y-4">
                    {(Object.keys(aiImagePrompts) as (keyof typeof aiImagePrompts)[]).map((promptKey) => (
                        <div key={promptKey} className="bg-gray-100 p-4 rounded-md flex justify-between items-start">
                           <div>
                                <h4 className="font-semibold text-xs text-gray-500 uppercase mb-1">{TABS[promptKey as ViewType] || promptKey}</h4>
                                <p className="text-sm text-gray-700 me-4">"{aiImagePrompts[promptKey]}"</p>
                           </div>
                           <button
                                onClick={() => copyToClipboard(aiImagePrompts[promptKey])}
                                className="text-gray-500 hover:text-indigo-600 transition-colors flex-shrink-0 mt-3"
                                title={t.copyPrompt}
                                aria-label="Copy prompt to clipboard"
                            >
                                {copiedPrompt === aiImagePrompts[promptKey] ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};
