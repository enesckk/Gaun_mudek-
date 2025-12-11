const cv = require("opencv.js");

console.log("✅ OpenCV.js yüklendi!");
console.log("OpenCV tipi: opencv.js");

// Basit bir matris oluşturalım
try {
  let mat = new cv.Mat(100, 100, cv.CV_8UC3);
  console.log("✅ Mat oluşturuldu:", mat.rows, "x", mat.cols);
  
  // Test: findContours, warpPerspective gibi fonksiyonlar var mı?
  console.log("findContours var mı?", typeof cv.findContours !== 'undefined');
  console.log("warpPerspective var mı?", typeof cv.warpPerspective !== 'undefined');
  console.log("getPerspectiveTransform var mı?", typeof cv.getPerspectiveTransform !== 'undefined');
  console.log("matFromArray var mı?", typeof cv.matFromArray !== 'undefined');
  
  mat.delete();
  console.log("✅ Test başarılı!");
} catch (error) {
  console.error("❌ Hata:", error.message);
}
