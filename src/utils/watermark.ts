import Jimp from 'jimp';
import { cv } from 'opencv-wasm';

/**
 * Region of interest — top-left, top-right, bottom-left, bottom-right corners
 * and centre strip. These are the canonical watermark locations.
 */
interface ROI {
    x: number;
    y: number;
    w: number;
    h: number;
}

function getWatermarkROIs(width: number, height: number): ROI[] {
    const cw = Math.floor(width * 0.25);
    const ch = Math.floor(height * 0.25);
    return [
        { x: 0, y: 0, w: cw, h: ch }, // top-left
        { x: width - cw, y: 0, w: cw, h: ch }, // top-right
        { x: 0, y: height - ch, w: cw, h: ch }, // bottom-left
        { x: width - cw, y: height - ch, w: cw, h: ch }, // bottom-right
        {
            x: Math.floor(width * 0.375), y: Math.floor(height * 0.375), // centre
            w: Math.floor(width * 0.25), h: Math.floor(height * 0.25)
        },
    ];
}

/**
 * Compute edge density within a specific rectangular region.
 * Returns the ratio of edge pixels to total pixels in that region.
 */
function regionEdgeDensity(
    cv: any,
    edges: any,
    roi: ROI,
): number {
    const rect = new cv.Rect(roi.x, roi.y, roi.w, roi.h);
    const region = edges.roi(rect);
    const count = cv.countNonZero(region);
    const total = roi.w * roi.h;
    region.delete();
    return total > 0 ? count / total : 0;
}

/**
 * Compute local contrast variance within a region.
 * Watermark overlays create abnormally uniform high-frequency patches.
 */
function regionContrastVariance(
    cv: any,
    gray: any,
    roi: ROI,
): number {
    const rect = new cv.Rect(roi.x, roi.y, roi.w, roi.h);
    const region = gray.roi(rect);
    const meanMat = new cv.Mat();
    const stdMat = new cv.Mat();
    const mask = new cv.Mat();
    cv.meanStdDev(region, meanMat, stdMat, mask);
    const variance = stdMat.data64F[0] ** 2;
    region.delete();
    meanMat.delete();
    stdMat.delete();
    mask.delete();
    return variance;
}

/**
 * Detect semi-transparent overlay signatures via alpha channel statistics.
 * Many watermarks are rendered at partial opacity (0.3–0.7).
 * Returns a score 0–1; higher = more likely an overlay exists.
 */
function alphaOverlayScore(image: Jimp, roi: ROI): number {
    let semiTransparentPixels = 0;
    let total = 0;

    for (let y = roi.y; y < roi.y + roi.h; y++) {
        for (let x = roi.x; x < roi.x + roi.w; x++) {
            const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
            // Alpha 60–200 is the "semi-transparent watermark" range
            if (rgba.a > 60 && rgba.a < 200) semiTransparentPixels++;
            total++;
        }
    }

    return total > 0 ? semiTransparentPixels / total : 0;
}

export interface WatermarkResult {
    detected: boolean;
    /** 0–1 composite score. Values above THRESHOLD indicate a watermark. */
    score: number;
    signals: {
        maxCornerEdgeDensity: number;
        centreEdgeDensity: number;
        cornerContrastAnomaly: boolean;
        alphaOverlay: boolean;
    };
}

const EDGE_DENSITY_THRESHOLD = 0.06;  // per-ROI edge density that's suspicious
const CONTRAST_ANOMALY_RATIO = 2.5;   // corner variance / body variance ratio
const ALPHA_OVERLAY_THRESHOLD = 0.04;  // fraction of semi-transparent pixels
const COMPOSITE_SCORE_THRESHOLD = 0.4;

export async function detectWatermark(imageBuffer: Buffer): Promise<WatermarkResult> {
    // cv is already imported synchronously from 'opencv-wasm'

    const image = await Jimp.read(imageBuffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Build OpenCV Mat from raw RGBA bytes
    const mat = new cv.Mat(height, width, cv.CV_8UC4);
    mat.data.set(image.bitmap.data);

    const gray = new cv.Mat();
    const edges = new cv.Mat();

    try {
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
        cv.Canny(gray, edges, 50, 150);

        const rois = getWatermarkROIs(width, height);
        const cornerROIs = rois.slice(0, 4);
        const centreROI = rois[4];

        // Signal 1: per-corner edge densities
        const cornerDensities = cornerROIs.map(r => regionEdgeDensity(cv, edges, r));
        const maxCornerDensity = Math.max(...cornerDensities);
        const centreEdgeDensity = regionEdgeDensity(cv, edges, centreROI);

        // Signal 2: corner contrast vs body contrast
        // Compute body variance from the centre 50% of the image
        const bodyROI: ROI = {
            x: Math.floor(width * 0.25),
            y: Math.floor(height * 0.25),
            w: Math.floor(width * 0.5),
            h: Math.floor(height * 0.5),
        };
        const bodyVariance = regionContrastVariance(cv, gray, bodyROI);
        const cornerVariances = cornerROIs.map(r => regionContrastVariance(cv, gray, r));
        const maxCornerVariance = Math.max(...cornerVariances);
        const cornerContrastAnomaly =
            bodyVariance > 0 && maxCornerVariance / bodyVariance > CONTRAST_ANOMALY_RATIO;

        // Signal 3: semi-transparent alpha overlay (only meaningful for PNG/RGBA sources)
        const alphaScores = rois.map(r => alphaOverlayScore(image, r));
        const maxAlphaScore = Math.max(...alphaScores);
        const alphaOverlay = maxAlphaScore > ALPHA_OVERLAY_THRESHOLD;

        // Composite score (weighted sum, 0–1)
        const score =
            (maxCornerDensity > EDGE_DENSITY_THRESHOLD ? 0.35 : 0) +
            (centreEdgeDensity > EDGE_DENSITY_THRESHOLD ? 0.20 : 0) +
            (cornerContrastAnomaly ? 0.25 : 0) +
            (alphaOverlay ? 0.20 : 0);

        console.log('--- Watermark Detection Debug ---');
        console.log({
            score,
            signals: {
                maxCornerEdgeDensity: maxCornerDensity,
                centreEdgeDensity,
                cornerContrastAnomaly,
                alphaOverlay,
            }
        });
        console.log('---------------------------------');

        return {
            detected: score >= COMPOSITE_SCORE_THRESHOLD,
            score,
            signals: {
                maxCornerEdgeDensity: maxCornerDensity,
                centreEdgeDensity,
                cornerContrastAnomaly,
                alphaOverlay,
            },
        };
    } finally {
        // Always clean up, even if an error is thrown mid-way
        mat.delete();
        gray.delete();
        edges.delete();
    }
}