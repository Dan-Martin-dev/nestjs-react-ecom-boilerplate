import { Injectable } from '@nestjs/common';

export interface ImageProcessingOptions {
  format: 'jpeg' | 'png' | 'svg' | 'webp';
  quality?: number; // 1-100 for lossy formats
  width?: number;
  height?: number;
  dpi?: number;
}

export interface PrintRequirements {
  minDpi: number;
  maxFileSize: number; // in MB
  preferredFormats: string[];
}

@Injectable()
export class ImageProcessingService {
  private readonly PRINT_REQUIREMENTS: PrintRequirements = {
    minDpi: 300,
    maxFileSize: 50, // 50MB
    preferredFormats: ['svg', 'tiff', 'png'],
  };

  /**
   * Determines if an image is suitable for print production
   */
  isPrintReady(image: {
    format: string;
    dpi?: number;
    fileSize?: number;
    isVector?: boolean;
  }): { ready: boolean; issues: string[] } {
    const issues: string[] = [];

    // Vector images (SVG) are always print-ready
    if (image.isVector || image.format === 'svg') {
      return { ready: true, issues: [] };
    }

    // Check DPI for raster images
    if (!image.dpi || image.dpi < this.PRINT_REQUIREMENTS.minDpi) {
      issues.push(
        `DPI too low: ${image.dpi || 0} (minimum: ${this.PRINT_REQUIREMENTS.minDpi})`,
      );
    }

    // Check file size
    if (
      image.fileSize &&
      image.fileSize > this.PRINT_REQUIREMENTS.maxFileSize * 1024 * 1024
    ) {
      issues.push(
        `File size too large: ${(image.fileSize / (1024 * 1024)).toFixed(1)}MB (max: ${this.PRINT_REQUIREMENTS.maxFileSize}MB)`,
      );
    }

    // Check format preference
    if (
      !this.PRINT_REQUIREMENTS.preferredFormats.includes(
        image.format.toLowerCase(),
      )
    ) {
      issues.push(
        `Format ${image.format} not optimal for printing. Preferred: ${this.PRINT_REQUIREMENTS.preferredFormats.join(', ')}`,
      );
    }

    return {
      ready: issues.length === 0,
      issues,
    };
  }

  /**
   * Gets optimal image settings for different use cases
   */
  getOptimalSettings(
    useCase: 'web' | 'print' | 'thumbnail',
  ): ImageProcessingOptions {
    switch (useCase) {
      case 'web':
        return {
          format: 'webp',
          quality: 85,
          width: 1200,
          height: 1200,
          dpi: 72,
        };

      case 'print':
        return {
          format: 'png', // Lossless for print
          width: 4000, // High resolution
          height: 4000,
          dpi: 300,
        };

      case 'thumbnail':
        return {
          format: 'jpeg',
          quality: 80,
          width: 300,
          height: 300,
          dpi: 72,
        };

      default:
        return this.getOptimalSettings('web');
    }
  }

  /**
   * Converts pixel dimensions to print dimensions
   */
  pixelsToPrintSize(pixels: number, dpi: number): number {
    return pixels / dpi; // Returns inches
  }

  /**
   * Calculates required pixel dimensions for print size
   */
  printSizeToPixels(inches: number, dpi: number): number {
    return Math.round(inches * dpi);
  }

  /**
   * Estimates file size for raster images
   */
  estimateFileSize(
    width: number,
    height: number,
    format: string,
    quality: number = 100,
  ): number {
    const bitsPerPixel = format === 'png' ? 24 : (quality / 100) * 24;
    const bytesPerPixel = bitsPerPixel / 8;
    return Math.round(width * height * bytesPerPixel);
  }
}
