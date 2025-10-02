
export interface DesignStyle {
  styleName: string;
  description: string;
  colorPalette: string[];
  keyFurniture: string[];
  lighting: string[];
  decor: string[];
  materials: string[];
}

export interface Dimensions {
  estimatedArea: string;
  estimatedVolume: string;
  userProvidedDimensions?: {
    length: string;
    width: string;
    height: string;
  }
}

export interface ImageAnalysisData {
  roomType: string;
  features: string[];
  lighting: string;
  detectedFurniture?: string[];
}

export interface RedesignConcept {
  title: string;
  layout: string;
  details: string;
  suggestedFurniture: {
    name: string;
    description: string;
  }[];
  summaryOfChanges?: string;
}

export interface ArabicSummary {
  title: string;
  concept: string;
}

export interface DesignAnalysis {
  imageAnalysis: ImageAnalysisData;
  designStyles: DesignStyle[];
  redesignConcept: RedesignConcept;
  dimensions: Dimensions;
  aiImagePrompts: {
    photorealistic: string;
    threeD: string;
    twoD: string;
  };
  arabicSummary: ArabicSummary;
}
