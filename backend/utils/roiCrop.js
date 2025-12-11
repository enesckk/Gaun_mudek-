import sharp from "sharp";

// Try to load OpenCV - will be set dynamically in functions
// Use global cv if available from markerDetect.js
let cv = null;
let opencvType = null;

/**
 * Warp image using perspective transform and crop ROIs
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} markers - Marker coordinates
 * @returns {Promise<Object>} Warped image buffer and ROI definitions
 */
async function warpAndDefineROIs(imageBuffer, markers) {
  // Use global cv if available (set by markerDetect.js)
  const opencv = global.cv || cv;
  const cvType = global.opencvType || opencvType;
  
  if (!opencv) {
    // Try to load OpenCV if not already loaded
    if (!cv) {
      try {
        // First try opencv4nodejs
        const cvModule = await import("opencv4nodejs").catch(() => null);
        if (cvModule) {
          cv = cvModule?.default || cvModule || null;
          if (cv) {
            opencvType = 'opencv4nodejs';
            global.cv = cv;
            global.opencvType = opencvType;
          }
        }
      } catch (error) {
        // Ignore, try opencv.js
      }
      
      // If opencv4nodejs not available, try opencv.js
      if (!cv) {
        try {
          const opencvJs = await import("opencv.js").catch(() => null);
          if (opencvJs) {
            cv = opencvJs.default || opencvJs;
            opencvType = 'opencv.js';
            global.cv = cv;
            global.opencvType = opencvType;
          }
        } catch (error) {
          cv = null;
        }
      }
    }
  }
  
  const finalCv = global.cv || cv;
  const finalCvType = global.opencvType || opencvType;
  
  if (!finalCv) {
    throw new Error(
      "Perspective transform requires OpenCV. Please install: npm install opencv4nodejs or npm install opencv.js"
    );
  }

  try {
    // Target canvas size
    const targetWidth = 2480;
    const targetHeight = 3508;

    // Source points (markers)
    const srcPoints = [
      [markers.topLeft.x, markers.topLeft.y],
      [markers.topRight.x, markers.topRight.y],
      [markers.bottomLeft.x, markers.bottomLeft.y],
      [markers.bottomRight.x, markers.bottomRight.y],
    ];

    // Destination points (corners of target canvas)
    const dstPoints = [
      [0, 0],
      [targetWidth, 0],
      [0, targetHeight],
      [targetWidth, targetHeight],
    ];

    let image, warped, warpedBuffer;

    if (finalCvType === 'opencv.js') {
      // opencv.js API - different approach
      // Convert buffer to image data using Sharp first
      const imageData = await sharp(imageBuffer)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
      
      const { data, info } = imageData;
      
      // Create Mat from image data
      image = new finalCv.Mat(info.height, info.width, finalCv.CV_8UC4);
      image.data.set(data);
      
      // Create source and destination point arrays
      const srcMat = finalCv.matFromArray(4, 1, finalCv.CV_32FC2, srcPoints.flat());
      const dstMat = finalCv.matFromArray(4, 1, finalCv.CV_32FC2, dstPoints.flat());
      
      // Get perspective transform matrix
      const transformMatrix = finalCv.getPerspectiveTransform(srcMat, dstMat);
      
      // Apply perspective transform
      warped = new finalCv.Mat();
      finalCv.warpPerspective(image, warped, transformMatrix, new finalCv.Size(targetWidth, targetHeight));
      
      // Convert back to buffer using Sharp
      const warpedData = new Uint8Array(warped.data);
      warpedBuffer = await sharp(warpedData, {
        raw: {
          width: targetWidth,
          height: targetHeight,
          channels: 4
        }
      }).png().toBuffer();
      
      // Cleanup
      image.delete();
      warped.delete();
      srcMat.delete();
      dstMat.delete();
      transformMatrix.delete();
    } else {
      // opencv4nodejs API (original code)
      image = finalCv.imdecode(imageBuffer);
      const srcMat = finalCv.matFromArray(4, 1, finalCv.CV_32FC2, srcPoints.flat());
      const dstMat = finalCv.matFromArray(4, 1, finalCv.CV_32FC2, dstPoints.flat());
      const transformMatrix = finalCv.getPerspectiveTransform(srcMat, dstMat);
      warped = image.warpPerspective(
        transformMatrix,
        new finalCv.Size(targetWidth, targetHeight)
      );
      warpedBuffer = Buffer.from(finalCv.imencode(".png", warped));
    }

    // Define ROIs (fixed pixel regions after warping)
    // Warp sonrası görüntü boyutu: 2480x3508
    // Orijinal görüntü boyutu: 1654x2339
    // Ölçek faktörü: scaleX = 2480/1654 ≈ 1.498, scaleY = 3508/2339 ≈ 1.500
    const studentNumberBoxes = [
      { x: 762, y: 1890, w: 99, h: 102 },   // Hane 1: (509,1260,575,1328) -> warp sonrası
      { x: 867, y: 1890, w: 100, h: 102 },  // Hane 2: (579,1260,646,1328)
      { x: 974, y: 1890, w: 100, h: 102 },  // Hane 3: (650,1260,717,1328)
      { x: 1080, y: 1890, w: 100, h: 102 }, // Hane 4: (721,1260,788,1328)
      { x: 1187, y: 1890, w: 100, h: 102 }, // Hane 5: (792,1260,859,1328)
      { x: 1293, y: 1890, w: 100, h: 102 }, // Hane 6: (863,1260,930,1328)
      { x: 1400, y: 1890, w: 100, h: 102 }, // Hane 7: (934,1260,1001,1328)
      { x: 1506, y: 1890, w: 100, h: 102 }, // Hane 8: (1005,1260,1072,1328)
      { x: 1612, y: 1890, w: 100, h: 102 }  // Hane 9: (1076,1260,1143,1328)
    ];

    const examIdBoxes = [
      { x: 980, y: 1350, w: 140, h: 140 },
      { x: 1120, y: 1350, w: 140, h: 140 },
    ];

    const questionScoreBoxes = [
      { number: 1, x: 1500, y: 1650, w: 350, h: 120 },
      { number: 2, x: 1500, y: 1770, w: 350, h: 120 },
      { number: 3, x: 1500, y: 1890, w: 350, h: 120 },
      { number: 4, x: 1500, y: 2010, w: 350, h: 120 },
      { number: 5, x: 1500, y: 2130, w: 350, h: 120 },
      { number: 6, x: 1500, y: 2250, w: 350, h: 120 },
      { number: 7, x: 1500, y: 2370, w: 350, h: 120 },
      { number: 8, x: 1500, y: 2490, w: 350, h: 120 },
      { number: 9, x: 1500, y: 2610, w: 350, h: 120 },
      { number: 10, x: 1500, y: 2730, w: 350, h: 120 },
    ];

    return {
      warpedImage: warpedBuffer,
      studentNumberBoxes,
      examIdBoxes,
      questionScoreBoxes,
    };
  } catch (error) {
    throw new Error(`ROI warping failed: ${error.message}`);
  }
}

/**
 * Crop a specific ROI from the warped image
 * @param {Buffer} warpedImageBuffer - Warped image buffer
 * @param {Object} roi - ROI definition {x, y, w, h}
 * @returns {Promise<Buffer>} Cropped image buffer
 */
async function cropROI(warpedImageBuffer, roi) {
  try {
    const cropped = await sharp(warpedImageBuffer)
      .extract({
        left: roi.x,
        top: roi.y,
        width: roi.w,
        height: roi.h,
      })
      .png()
      .toBuffer();

    return cropped;
  } catch (error) {
    throw new Error(`ROI cropping failed: ${error.message}`);
  }
}

export { warpAndDefineROIs, cropROI };

