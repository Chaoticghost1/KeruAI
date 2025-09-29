import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

// Dynamic import for pdf-parse to work with ES modules
async function importPdfParse() {
  const pdfParse = await import('pdf-parse');
  return pdfParse.default;
}

export interface ProcessedContent {
  extractedText: string;
  contentType: string;
  processingMethod: string;
  confidence?: number;
}

export class ContentProcessor {
  /**
   * Process uploaded content to extract text for AI analysis
   */
  static async processFile(filePath: string, contentType: string): Promise<ProcessedContent> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      
      switch (fileExtension) {
        case '.pdf':
          return await this.processPDF(filePath);
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
          return await this.processImage(filePath);
        case '.txt':
          return await this.processTextFile(filePath);
        case '.html':
        case '.htm':
          return await this.processHTML(filePath);
        default:
          return {
            extractedText: '',
            contentType,
            processingMethod: 'unsupported',
            confidence: 0
          };
      }
    } catch (error) {
      console.error('Content processing error:', error);
      return {
        extractedText: '',
        contentType,
        processingMethod: 'error',
        confidence: 0
      };
    }
  }

  /**
   * Extract text from PDF files
   */
  private static async processPDF(filePath: string): Promise<ProcessedContent> {
    try {
      const pdfParse = await importPdfParse();
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        extractedText: data.text.trim(),
        contentType: 'pdf',
        processingMethod: 'pdf-parse',
        confidence: data.text.length > 0 ? 95 : 0
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  /**
   * Extract text from images using OCR
   */
  private static async processImage(filePath: string): Promise<ProcessedContent> {
    try {
      const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng+spa', {
        logger: m => console.log('OCR Progress:', m)
      });
      
      return {
        extractedText: text.trim(),
        contentType: 'image',
        processingMethod: 'tesseract-ocr',
        confidence: Math.round(confidence)
      };
    } catch (error) {
      console.error('Image OCR error:', error);
      throw new Error('Failed to process image file');
    }
  }

  /**
   * Extract text from plain text files
   */
  private static async processTextFile(filePath: string): Promise<ProcessedContent> {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      
      return {
        extractedText: text.trim(),
        contentType: 'text',
        processingMethod: 'direct-read',
        confidence: 100
      };
    } catch (error) {
      console.error('Text file processing error:', error);
      throw new Error('Failed to process text file');
    }
  }

  /**
   * Extract text from HTML files
   */
  private static async processHTML(filePath: string): Promise<ProcessedContent> {
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      // Simple HTML tag stripping - in production, consider using a proper HTML parser
      const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      return {
        extractedText: textContent,
        contentType: 'html',
        processingMethod: 'html-strip',
        confidence: 90
      };
    } catch (error) {
      console.error('HTML processing error:', error);
      throw new Error('Failed to process HTML file');
    }
  }

  /**
   * Validate and clean extracted text
   */
  static cleanExtractedText(text: string): string {
    if (!text) return '';
    
    // Remove excessive whitespace and normalize line breaks
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .substring(0, 50000); // Limit to 50k characters for AI processing
  }

  /**
   * Generate summary metadata about the extracted content
   */
  static generateContentMetadata(extractedText: string): {
    wordCount: number;
    characterCount: number;
    hasContent: boolean;
    estimatedReadingTime: number;
  } {
    const wordCount = extractedText ? extractedText.split(/\s+/).length : 0;
    const characterCount = extractedText ? extractedText.length : 0;
    const hasContent = wordCount > 5; // Consider content valid if more than 5 words
    const estimatedReadingTime = Math.ceil(wordCount / 200); // ~200 words per minute
    
    return {
      wordCount,
      characterCount,
      hasContent,
      estimatedReadingTime
    };
  }
}