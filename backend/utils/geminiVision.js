import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";

/**
 * Projede tercih edilen model isimleri
 * Limitlere göre optimize edilmiş sıralama:
 * 
 * Model Limitleri (RPM/TPM/RPD):
 * - gemini-2.5-flash: 10/1K RPM, 4.3K/1M TPM, 103/10K RPD ⭐ EN İYİ
 * - gemini-2.0-flash: 2/2K RPM, 16/4M TPM, 4/Unlimited RPD
 * - gemini-2.0-flash-lite: 3/4K RPM, 12/4M TPM, 4/Unlimited RPD
 * - gemini-2.5-flash-lite: 1/4K RPM, 9/4M TPM, 2/Unlimited RPD
 * - gemini-2.5-pro: 1/150 RPM, 9/2M TPM, 2/10K RPD (çok düşük limit!)
 */
const PREFERRED_MODELS = [
  "gemini-2.5-flash",        // ⭐ En yüksek limitler: 10 RPM/1K, 4.3K TPM/1M, 103 RPD/10K
  "gemini-2.0-flash",        // Yüksek limitler: 2 RPM/2K, 16 TPM/4M, 4 RPD/Unlimited
  "gemini-2.0-flash-lite",   // İyi limitler: 3 RPM/4K, 12 TPM/4M, 4 RPD/Unlimited
  "gemini-2.5-flash-lite",   // Orta limitler: 1 RPM/4K, 9 TPM/4M, 2 RPD/Unlimited
  "gemini-2.5-pro",          // ⚠️ Düşük limitler: 1 RPM/150, 9 TPM/2M, 2 RPD/10K (sadece fallback)
  // Eski modeller (fallback - genellikle çalışmıyor)
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

/**
 * Initialize Gemini Vision API client
 */
function getGeminiClient() {
  // GOOGLE_API_KEY fallback'i eklendi
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY / GOOGLE_API_KEY bulunamadı!");
    console.error("💡 .env dosyasında şu şekilde tanımlayın:");
    console.error("   GEMINI_API_KEY=AIzaSy...");
    console.error("   veya");
    console.error("   GOOGLE_API_KEY=AIzaSy...");
    console.error("   (Tırnak kullanmayın, sadece değeri yazın)");
    throw new Error("GEMINI_API_KEY / GOOGLE_API_KEY is not configured");
  }

  // API key'deki boşlukları temizle (yanlışlıkla tırnak içinde yazılmış olabilir)
  const cleanApiKey = apiKey.trim().replace(/^["']|["']$/g, "");

  if (cleanApiKey !== apiKey) {
    console.warn("⚠️ API key'de tırnak işareti tespit edildi, temizlendi.");
  }

  // API key formatını kontrol et
  if (cleanApiKey.length < 20) {
    console.error(
      `❌ API key çok kısa (${cleanApiKey.length} karakter). En az 20 karakter olmalı.`
    );
    throw new Error("API key çok kısa");
  }

  // API key'in başında "AIza" olmalı (Google API key formatı)
  if (!cleanApiKey.startsWith("AIza")) {
    console.error(`❌ API key formatı yanlış!`);
    console.error(
      `   API key 'AIza' ile başlamalı. Şu anki başlangıç: "${cleanApiKey.substring(
        0,
        4
      )}"`
    );
    console.error(
      `   Google AI Studio'dan yeni bir API key alın: https://aistudio.google.com/app/apikey`
    );
    throw new Error("API key formatı yanlış");
  }

  console.log(
    `✅ API key bulundu (${cleanApiKey.length} karakter, ${cleanApiKey.substring(
      0,
      10
    )}...)`
  );

  return new GoogleGenerativeAI(cleanApiKey);
}

/**
 * (Opsiyonel) Tüm modelleri listeleyip log'lar – debugging için.
 */
export async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ Model listesi için API key bulunamadı");
    return { models: [], error: "API key bulunamadı" };
  }

  const cleanApiKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const results = { models: [], errors: [] };

  // Hem v1 hem v1beta API versiyonlarını dene
  const apiVersions = ["v1", "v1beta"];
  
  for (const version of apiVersions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${cleanApiKey}`;
      console.log(`🔍 ${version} API versiyonunu kontrol ediyor...`);
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ ${version} ListModels hatası: ${res.status} ${errorText.substring(0, 200)}`);
        results.errors.push({ version, status: res.status, error: errorText.substring(0, 200) });
        continue;
      }
      
      const data = await res.json();
      console.log(`✅ ${version} API versiyonunda ${data.models?.length || 0} model bulundu:`);
      
      if (data.models && data.models.length > 0) {
        for (const m of data.models) {
          const modelName = m.name || m.displayName;
          console.log(`   - ${modelName}`);
          results.models.push({
            name: modelName,
            displayName: m.displayName,
            version: version,
            supportedMethods: m.supportedGenerationMethods || []
          });
        }
        return results; // İlk başarılı sonucu döndür
      }
    } catch (e) {
      console.error(`❌ ${version} ListModels isteği başarısız:`, e?.message || e);
      results.errors.push({ version, error: e?.message || String(e) });
    }
  }
  
  return results;
}

/**
 * Test API key and list available models
 * Bu fonksiyon API key'in çalışıp çalışmadığını test eder
 */
export async function testGeminiAPI() {
  const results = {
    apiKeyFound: false,
    apiKeyFormat: "unknown",
    testedModels: [],
    workingModel: null,
    errors: [],
  };

  try {
    // Önce mevcut modelleri listele
    const modelList = await listGeminiModels();
    const availableModelNames = modelList.models?.map(m => m.name) || [];
    
    // Eğer mevcut modeller varsa, onları da test listesine ekle
    const modelsToTest = [...PREFERRED_MODELS];
    if (availableModelNames.length > 0) {
      console.log(`📋 API'den ${availableModelNames.length} model bulundu, bunlar da test edilecek`);
      for (const modelName of availableModelNames) {
        // Model adı "models/" ile başlıyorsa kaldır
        const cleanName = modelName.replace(/^models\//, '');
        if (!modelsToTest.includes(cleanName)) {
          modelsToTest.push(cleanName);
        }
      }
    }
    
    const genAI = getGeminiClient();
    results.apiKeyFound = true;
    results.apiKeyFormat = "valid";

    console.log("🔍 Gemini modellerini test ediyor...");
    console.log(`📋 ${modelsToTest.length} model test edilecek`);

    for (const modelName of modelsToTest) {
      try {
        console.log(`   🧪 "${modelName}" test ediliyor...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Basit bir test çağrısı yap (sadece metin, görüntü olmadan)
        const result = await model.generateContent("Basit bir test cümlesi.");
        const response = result.response;
        const text = (await response.text()).substring(0, 50);

        console.log(
          `   ✅ Model "${modelName}" çalışıyor! Yanıt: "${text}..."`
        );

        results.testedModels.push({
          name: modelName,
          status: "working",
          response: text,
        });

        if (!results.workingModel) {
          results.workingModel = modelName;
        }
      } catch (error) {
        const errorMsg = error?.message || String(error);
        const shortError = errorMsg.substring(0, 200);

        console.log(
          `   ❌ Model "${modelName}" çalışmıyor: ${shortError}`
        );

        results.testedModels.push({
          name: modelName,
          status: "failed",
          error: shortError,
        });

        results.errors.push({
          model: modelName,
          error: shortError,
        });

        continue;
      }
    }

    if (!results.workingModel) {
      console.error("❌ Hiçbir model çalışmıyor!");
      console.error("💡 Olası nedenler:");
      console.error("   1. API key yanlış veya geçersiz");
      console.error("   2. API key'in Gemini API erişimi yok");
      console.error("   3. Google AI Studio'da API key'in aktif olması gerekiyor");
      console.error(
        "   4. API key'in oluşturulmasından sonra birkaç dakika beklemeniz gerekebilir"
      );

      return {
        success: false,
        error: "Hiçbir model çalışmıyor",
        details: results,
      };
    }

    return {
      success: true,
      workingModel: results.workingModel,
      details: results,
      };
  } catch (error) {
    const errorMsg = error?.message || String(error);
    console.error("❌ Gemini API test hatası:", errorMsg);

    results.errors.push({
      general: errorMsg,
    });

    return {
      success: false,
      error: errorMsg,
      details: results,
    };
  }
}

/**
 * Extract numeric value from an image using Gemini Vision API
 * @param {Buffer} imageBuffer - Image buffer (PNG)
 * @returns {Promise<number>} Extracted number (0 if empty)
 */
async function extractNumberFromImage(imageBuffer) {
  const genAI = getGeminiClient();

  // Görüntü ön işleme: kontrast artırma, keskinleştirme, boyut kontrolü
  let processedBuffer = imageBuffer;
  const imageMetadata = await sharp(imageBuffer).metadata().catch(() => null);
  
  if (imageMetadata) {
    console.log(
      `   📷 Görüntü boyutu: ${imageMetadata.width}x${imageMetadata.height}px`
    );

    // Görüntü çok küçükse uyarı ver ve minimum boyut kontrolü yap
    if ((imageMetadata.width || 0) < 100 || (imageMetadata.height || 0) < 50) {
      console.warn(
        `   ⚠️ Görüntü çok küçük (${imageMetadata.width}x${imageMetadata.height}px)! Bu, template koordinatlarının yanlış olabileceğini gösterir.`
      );
      console.warn(
        `   💡 Görüntü en az 100x50px olmalı. Şu anki boyut yeterli değil, Gemini doğru okuyamayabilir.`
      );
    }

    // Görüntü ön işleme: kontrast artırma, keskinleştirme, boyut büyütme (küçükse)
    try {
      let pipeline = sharp(imageBuffer);
      
      // Eğer görüntü çok küçükse, 2x büyüt
      if ((imageMetadata.width || 0) < 200 || (imageMetadata.height || 0) < 100) {
        pipeline = pipeline.resize(
          Math.max(200, (imageMetadata.width || 0) * 2),
          Math.max(100, (imageMetadata.height || 0) * 2),
          { kernel: sharp.kernel.lanczos3 }
        );
        console.log(`   🔍 Görüntü büyütüldü: ${imageMetadata.width}x${imageMetadata.height}px -> ${Math.max(200, (imageMetadata.width || 0) * 2)}x${Math.max(100, (imageMetadata.height || 0) * 2)}px`);
      }
      
      // Kontrast artırma (normalize)
      pipeline = pipeline.normalize();
      
      // Keskinleştirme (hafif)
      pipeline = pipeline.sharpen({ sigma: 1, flat: 1, jagged: 2 });
      
      // Gri tonlama (OCR için daha iyi)
      pipeline = pipeline.greyscale();
      
      processedBuffer = await pipeline.png().toBuffer();
      console.log(`   ✨ Görüntü ön işleme tamamlandı: kontrast artırıldı, keskinleştirildi`);
    } catch (preprocessError) {
      console.warn(`   ⚠️ Görüntü ön işleme hatası, orijinal görüntü kullanılıyor:`, preprocessError.message);
      processedBuffer = imageBuffer;
    }
  }

  // Convert buffer to base64
  const base64Image = processedBuffer.toString("base64");

     let lastError = null;

  // Prompt'u bir kez tanımla (retry'lerde de kullanılacak)
  const prompt = `You are analyzing a score box from an exam paper. Your task is to extract the numeric score value.

IMPORTANT INSTRUCTIONS:
1. Look carefully at the image - it contains a handwritten or printed number in a score box
2. Extract ONLY the numeric value (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, etc.)
3. The number can be anywhere from 0 to 100
4. If you see multiple numbers, return the largest/most prominent one
5. If the box is completely empty or you cannot see any number clearly, return 0
6. Return ONLY the number, no text, no explanation, no punctuation - just the digit(s)

Examples:
- If you see "10", return: 10
- If you see "5", return: 5
- If you see "0", return: 0
- If empty, return: 0
- If unclear but you see something like "3", return: 3

Now analyze the image and return ONLY the number:`;

  // Tercih edilen modelleri sırayla dene
  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/png",
          },
        },
      ]);

      const response = result.response;
      const text = (await response.text()).trim();

      console.log(`   🤖 Gemini yanıtı (${modelName}): "${text}"`);

      // Parse the response
      if (!text || text === "" || text.toLowerCase() === "empty") {
        console.log(`   ⚠️ Boş görüntü tespit edildi, 0 döndürülüyor`);
        return 0;
      }

      // Extract first number from response
      const numberMatch = text.match(/\d+/);
      if (!numberMatch) {
        console.error(
          `   ❌ Geçersiz yanıt: "${text}" - sayı bulunamadı`
        );
        throw new Error(
          `Invalid score value detected. Gemini response: "${text}"`
        );
      }

      const number = parseInt(numberMatch[0], 10);
      if (isNaN(number)) {
        console.error(`   ❌ Geçersiz sayı: "${numberMatch[0]}"`);
        throw new Error(
          `Invalid score value detected. Parsed value: "${numberMatch[0]}"`
        );
      }

      return number;
    } catch (error) {
      const msg = error?.message || String(error);

      // 503 veya 429 hatası - retry yapılabilir
      if (
        msg.includes("503") ||
        msg.includes("overloaded") ||
        msg.includes("429") ||
        msg.includes("rate limit") ||
        msg.includes("Service Unavailable")
      ) {
        // Exponential backoff ile retry
        const maxRetries = 3;
        let retrySuccess = false;
        
        for (let retry = 1; retry <= maxRetries; retry++) {
          const delay = Math.pow(2, retry - 1) * 1000; // 1s, 2s, 4s
          console.warn(
            `   ⚠️ Model "${modelName}" aşırı yüklü (503/429), ${delay}ms sonra tekrar deneniyor... (deneme ${retry}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));

          try {
            const retryModel = genAI.getGenerativeModel({ model: modelName });
            const retryResult = await retryModel.generateContent([
              prompt,
              {
                inlineData: {
                  data: base64Image,
                  mimeType: "image/png",
                },
              },
            ]);
            const retryResponse = retryResult.response;
            const retryText = (await retryResponse.text()).trim();
            console.log(
              `   🤖 Gemini yanıtı (${modelName}, retry ${retry}): "${retryText}"`
            );

            if (retryText && retryText !== "" && retryText.toLowerCase() !== "empty") {
              const numberMatch = retryText.match(/\d+/);
              if (numberMatch) {
                const number = parseInt(numberMatch[0], 10);
                if (!isNaN(number) && number >= 0 && number <= 100) {
                  console.log(`   ✅ Sayı çıkarıldı (retry ${retry}): ${number}`);
                  return number;
                }
              }
            }
            retrySuccess = true;
            break; // Başarılı, döngüden çık
          } catch (retryError) {
            if (retry === maxRetries) {
              console.warn(
                `   ⚠️ Model "${modelName}" ${maxRetries} kez denendi ama hala aşırı yüklü, bir sonraki model deneniyor...`
              );
              lastError = retryError;
            }
            // Continue to next retry
          }
        }
        
        if (retrySuccess) {
          continue; // Başarılı oldu, bir sonraki modele geçme
        }
        // If all retries failed, continue to next model
        continue;
      }

      // Model bulunamadı hatası ise bir sonraki modeli dene
      if (
        msg.includes("not found") ||
        msg.includes("404") ||
        msg.includes("is not found")
      ) {
        console.warn(
          `   ⚠️ Model "${modelName}" bulunamadı, bir sonraki model deneniyor...`
        );
        lastError = error;
        continue;
      }

      // API key "leaked" hatası - özel mesaj
      if (msg.includes("leaked") || msg.includes("reported as leaked")) {
        console.error(`   ❌ ⚠️ API KEY SIZDIRILMIŞ OLARAK İŞARETLENMİŞ!`);
        console.error(`   🔒 Bu API key public bir yerde (GitHub, forum, vb.) paylaşıldığı için Google tarafından devre dışı bırakılmış.`);
        console.error(`   💡 ÇÖZÜM:`);
        console.error(`      1. Google AI Studio'ya gidin: https://aistudio.google.com/app/apikey`);
        console.error(`      2. Mevcut API key'i SİLİN veya devre dışı bırakın`);
        console.error(`      3. YENİ bir API key oluşturun`);
        console.error(`      4. Yeni key'i .env dosyasına ekleyin (tırnak OLMADAN):`);
        console.error(`         GEMINI_API_KEY=AIzaSyYeniKey...`);
        console.error(`      5. Sunucuyu yeniden başlatın`);
        console.error(`      6. ⚠️ Yeni key'i ASLA public repository'lere commit etmeyin!`);
        console.error(`         .env dosyasını .gitignore'a ekleyin.`);
        
        throw new Error(
          `API key sızdırılmış olarak işaretlenmiş. Lütfen Google AI Studio'dan yeni bir API key oluşturun ve .env dosyasını güncelleyin. Yeni key'i public repository'lere commit etmeyin!`
        );
      }

      // API key hatası ise özel mesaj ver
      if (
        msg.includes("API_KEY") ||
        msg.includes("401") ||
        msg.includes("403") ||
        msg.includes("PERMISSION_DENIED") ||
        msg.includes("INVALID_API_KEY")
      ) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        const apiKeyPreview = apiKey ? `${apiKey.substring(0, 10)}... (${apiKey.length} karakter)` : "BULUNAMADI";
        
        console.error(`   ❌ Gemini API key hatası!`);
        console.error(`   📋 API Key durumu: ${apiKeyPreview}`);
        console.error(`   🔍 Hata detayı: ${msg}`);
        console.error(`   💡 Çözüm adımları:`);
        console.error(`      1. Google AI Studio'ya gidin: https://aistudio.google.com/app/apikey`);
        console.error(`      2. Yeni bir API key oluşturun veya mevcut key'i kontrol edin`);
        console.error(`      3. .env dosyasında şu şekilde tanımlayın (tırnak OLMADAN):`);
        console.error(`         GEMINI_API_KEY=AIzaSy...`);
        console.error(`      4. Sunucuyu yeniden başlatın`);
        console.error(`      5. API key'in aktif olması için birkaç dakika bekleyin`);
        
        throw new Error(
          `Gemini API key hatası: ${msg}. API Key: ${apiKeyPreview}. Lütfen .env dosyasındaki GEMINI_API_KEY / GOOGLE_API_KEY'i kontrol edin ve Google AI Studio'dan yeni bir key alın.`
        );
      }

      // Diğer hatalar için fırlat
      throw error;
    }
  }

  // Tüm modeller denendi ama hiçbiri çalışmadı
  console.error(`   ❌ Tüm Gemini modelleri denendi ama hiçbiri çalışmadı!`);
  console.error(`   💡 İpuçları:`);
  console.error(`      - API key'in doğru olduğundan emin olun`);
  console.error(`      - API key'in aktif olduğunu kontrol edin`);
  console.error(`      - Google AI Studio'dan yeni bir API key almayı deneyin`);
  throw new Error(
    `Tüm Gemini modelleri denendi ama hiçbiri çalışmadı. Son hata: ${
      lastError?.message || "Bilinmeyen hata"
    }`
  );
}

/**
 * Extract student id (numeric) from a full page image using Gemini Vision
 * @param {Buffer} imageBuffer - PNG buffer
 * @returns {Promise<string|null>} student number or null
 */
async function extractStudentIdFromImage(imageBuffer) {
  try {
    const genAI = getGeminiClient();
    const base64Image = imageBuffer.toString("base64");

    let lastError = null;

    for (const modelName of PREFERRED_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt =
          "Extract ONLY the student ID number from this exam paper. Return just the digits without spaces or text. If not found, return EMPTY.";

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/png",
            },
          },
        ]);

        const text = (await result.response.text()).trim();
        console.log(
          `   🤖 Student ID yanıtı (${modelName}): "${text}"`
        );

        if (!text || text.toLowerCase() === "empty") return null;

        const match = text.match(/\d{5,12}/);
        return match ? match[0] : null;
      } catch (error) {
        const msg = error?.message || String(error);

        if (
          msg.includes("not found") ||
          msg.includes("404") ||
          msg.includes("is not found")
        ) {
          console.warn(
            `   ⚠️ Model "${modelName}" bulunamadı, bir sonraki model deneniyor...`
          );
          lastError = error;
          continue;
        }

        // API key "leaked" hatası - özel mesaj
        if (msg.includes("leaked") || msg.includes("reported as leaked")) {
          console.error(`   ❌ ⚠️ API KEY SIZDIRILMIŞ OLARAK İŞARETLENMİŞ!`);
          console.error(`   🔒 Bu API key public bir yerde paylaşıldığı için Google tarafından devre dışı bırakılmış.`);
          console.error(`   💡 ÇÖZÜM: Google AI Studio'dan yeni bir API key oluşturun: https://aistudio.google.com/app/apikey`);
          throw new Error(
            `API key sızdırılmış olarak işaretlenmiş. Lütfen Google AI Studio'dan yeni bir API key oluşturun.`
          );
        }

        if (
          msg.includes("API_KEY") ||
          msg.includes("401") ||
          msg.includes("403") ||
          msg.includes("PERMISSION_DENIED") ||
          msg.includes("INVALID_API_KEY")
        ) {
          const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
          const apiKeyPreview = apiKey ? `${apiKey.substring(0, 10)}... (${apiKey.length} karakter)` : "BULUNAMADI";
          
          console.error(`   ❌ Gemini API key hatası!`);
          console.error(`   📋 API Key durumu: ${apiKeyPreview}`);
          console.error(`   🔍 Hata detayı: ${msg}`);
          console.error(`   💡 Çözüm: Google AI Studio'dan yeni bir API key alın: https://aistudio.google.com/app/apikey`);
          
          throw new Error(
            `Gemini API key hatası: ${msg}. API Key: ${apiKeyPreview}. Lütfen .env dosyasındaki GEMINI_API_KEY / GOOGLE_API_KEY'i kontrol edin.`
          );
        }

        lastError = error;
      }
    }

    console.error(
      `   ❌ Student ID için tüm modeller denendi ama hiçbiri çalışmadı.`
    );
    console.error(
      `      Son hata: ${lastError?.message || "bilinmeyen hata"}`
    );
    return null;
  } catch (error) {
    console.error("❌ extractStudentIdFromImage hatası:", error);
    return null;
  }
}

/**
 * Extract a single digit (0-9) from an image - optimized for student number boxes
 * Uses multiple models and voting for better accuracy
 * @param {Buffer} imageBuffer - Image buffer containing a single digit
 * @returns {Promise<number>} Extracted digit (0-9)
 */
async function extractDigitFromImage(imageBuffer) {
  const genAI = getGeminiClient();

  // Görüntü ön işleme: kontrast artırma, keskinleştirme, boyut kontrolü
  let processedBuffer = imageBuffer;
  const imageMetadata = await sharp(imageBuffer).metadata().catch(() => null);
  
  if (imageMetadata) {
    try {
      let pipeline = sharp(imageBuffer);
      
      // Görüntü çok küçükse büyüt (minimum 200x200px - daha büyük = daha iyi OCR)
      const targetWidth = Math.max(200, (imageMetadata.width || 50) * 4);
      const targetHeight = Math.max(200, (imageMetadata.height || 50) * 4);
      
      pipeline = pipeline.resize(targetWidth, targetHeight, { 
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 }
      });
      
      // Agresif kontrast artırma
      pipeline = pipeline.normalize();
      
      // Güçlü keskinleştirme (rakam okuma için kritik)
      pipeline = pipeline.sharpen({ 
        sigma: 2, 
        flat: 1, 
        jagged: 3 
      });
      
      // Gri tonlama
      pipeline = pipeline.greyscale();
      
      // Ek kontrast artırma (threshold ile)
      pipeline = pipeline.linear(1.2, -(128 * 0.2)); // Kontrast artırma
      
      processedBuffer = await pipeline.png().toBuffer();
      console.log(`   🔍 Görüntü iyileştirildi: ${imageMetadata.width}x${imageMetadata.height}px -> ${targetWidth}x${targetHeight}px`);
    } catch (preprocessError) {
      console.warn(`   ⚠️ Görüntü ön işleme hatası:`, preprocessError.message);
      processedBuffer = imageBuffer;
    }
  }

  const base64Image = processedBuffer.toString("base64");
  const prompt = `You are analyzing a SINGLE DIGIT box from a student ID number on an exam paper.

CRITICAL INSTRUCTIONS:
1. This image contains ONLY ONE digit (0, 1, 2, 3, 4, 5, 6, 7, 8, or 9)
2. Look very carefully at the center of the image - the digit should be clearly visible
3. Extract ONLY that single digit - return just the number, nothing else
4. If the box is completely empty or you cannot see any digit clearly, return 0
5. Be very precise - this is a single digit box, not a score box

Examples:
- If you see "5", return: 5
- If you see "0", return: 0
- If you see "9", return: 9
- If empty/unclear, return: 0

Now analyze the image carefully and return ONLY the single digit (0-9):`;

  // Birden fazla model ile oku ve en çok tekrar eden sonucu kullan (voting)
  const results = [];
  const maxModels = Math.min(3, PREFERRED_MODELS.length); // İlk 3 modeli kullan
  
  for (let i = 0; i < maxModels; i++) {
    const modelName = PREFERRED_MODELS[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/png",
          },
        },
      ]);

      const text = (await result.response.text()).trim();
      console.log(`   🤖 Digit yanıtı (${modelName}): "${text}"`);

      if (!text || text === "" || text.toLowerCase() === "empty") {
        results.push(0);
        continue;
      }

      // Extract first digit (0-9)
      const digitMatch = text.match(/\b[0-9]\b/);
      if (digitMatch) {
        const digit = parseInt(digitMatch[0], 10);
        if (digit >= 0 && digit <= 9) {
          results.push(digit);
          continue;
        }
      }

      // Fallback: try to extract any single digit
      const anyDigit = text.match(/\d/);
      if (anyDigit) {
        const digit = parseInt(anyDigit[0], 10);
        if (digit >= 0 && digit <= 9) {
          results.push(digit);
          continue;
        }
      }
      
      // Geçersiz yanıt
      results.push(0);
    } catch (error) {
      const msg = error?.message || String(error);
      if (msg.includes("not found") || msg.includes("404")) {
        continue;
      }
      console.warn(`   ⚠️ Model ${modelName} hatası:`, msg);
      results.push(0); // Hata durumunda 0 ekle
    }
  }

  // Voting: En çok tekrar eden rakamı seç
  if (results.length > 0) {
    const digitCounts = {};
    results.forEach(digit => {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    });
    
    // En çok oy alan rakamı bul
    let maxCount = 0;
    let chosenDigit = 0;
    for (const [digit, count] of Object.entries(digitCounts)) {
      if (count > maxCount) {
        maxCount = count;
        chosenDigit = parseInt(digit, 10);
      }
    }
    
    const agreement = (maxCount / results.length * 100).toFixed(1);
    console.log(`   📊 Voting: ${results.join(', ')} -> ${chosenDigit} (${agreement}% uyum)`);
    
    return chosenDigit;
  }

  console.error(`   ❌ Hiçbir model sonuç döndüremedi, 0 döndürülüyor`);
  return 0;
}

/**
 * Extract student number from digit boxes with validation and retry
 * @param {Array<Buffer>} digitBoxes - Array of image buffers (9 haneli)
 * @returns {Promise<string>} Student number string
 */
async function extractStudentNumber(digitBoxes) {
  if (!digitBoxes || digitBoxes.length === 0) {
    console.warn(`⚠️ Öğrenci numarası için digit box bulunamadı`);
    return "";
  }

  console.log(`🔍 Öğrenci numarası okunuyor: ${digitBoxes.length} hane`);
  
  const digits = [];
  const retryAttempts = 1; // Her rakam için 1 retry (voting zaten 3 model kullanıyor)
  
  for (let i = 0; i < digitBoxes.length; i++) {
    let digit = null;
    let digitResults = []; // Retry'lerde farklı sonuçlar almak için
    
    // Retry mekanizması
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const extractedDigit = await extractDigitFromImage(digitBoxes[i]);
        digitResults.push(extractedDigit);
        
        // Doğrulama: rakam 0-9 arasında olmalı
        if (extractedDigit >= 0 && extractedDigit <= 9) {
          digit = extractedDigit;
          // Eğer retry yapıldıysa ve sonuçlar tutarlıysa, erken çık
          if (attempt > 0 && digitResults.length >= 2) {
            const allSame = digitResults.every(d => d === digit);
            if (allSame) {
              digits.push(digit.toString());
              console.log(`   ✅ Hane ${i + 1}: ${digit} (${attempt + 1} deneme, tutarlı)`);
              break;
            }
          }
          // İlk denemede başarılıysa devam et (voting zaten yapıldı)
          if (attempt === 0) {
            digits.push(digit.toString());
            console.log(`   ✅ Hane ${i + 1}: ${digit}`);
            break; // Başarılı, retry'den çık
          }
        } else {
          console.warn(`   ⚠️ Hane ${i + 1}: Geçersiz rakam ${extractedDigit}, retry yapılıyor...`);
          if (attempt < retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, 300)); // 300ms bekle
            continue;
          }
        }
      } catch (error) {
        console.warn(`   ⚠️ Hane ${i + 1} okuma hatası (deneme ${attempt + 1}/${retryAttempts + 1}):`, error.message);
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300)); // 300ms bekle
          continue;
        }
      }
    }
    
    // Tüm denemeler başarısız oldu veya tutarsız sonuçlar varsa
    if (digit === null || digit < 0 || digit > 9) {
      // Eğer retry yapıldıysa, en çok tekrar eden rakamı kullan
      if (digitResults.length > 1) {
        const digitCounts = {};
        digitResults.forEach(d => {
          if (d >= 0 && d <= 9) {
            digitCounts[d] = (digitCounts[d] || 0) + 1;
          }
        });
        let maxCount = 0;
        let chosenDigit = 0;
        for (const [d, count] of Object.entries(digitCounts)) {
          if (count > maxCount) {
            maxCount = count;
            chosenDigit = parseInt(d, 10);
          }
        }
        if (maxCount > 0) {
          digit = chosenDigit;
          digits.push(digit.toString());
          console.log(`   ✅ Hane ${i + 1}: ${digit} (voting: ${digitResults.join(', ')})`);
        } else {
          console.error(`   ❌ Hane ${i + 1} okunamadı, varsayılan olarak "0" kullanılıyor`);
          digits.push("0");
        }
      } else {
        console.error(`   ❌ Hane ${i + 1} okunamadı, varsayılan olarak "0" kullanılıyor`);
        digits.push("0"); // Varsayılan olarak 0
      }
    }
  }
  
  const studentNumber = digits.join("");
  console.log(`📋 Okunan öğrenci numarası: ${studentNumber} (${studentNumber.length} hane)`);
  
  // Doğrulama: öğrenci numarası genellikle 7-9 haneli olmalı
  if (studentNumber.length < 7) {
    console.warn(`⚠️ Öğrenci numarası çok kısa: ${studentNumber} (${studentNumber.length} hane, beklenen: 7-9)`);
  }
  
  return studentNumber;
}

/**
 * Extract exam ID from 2 digit boxes
 * @param {Array<Buffer>} digitBoxes - Array of 2 image buffers
 * @returns {Promise<string>} Exam ID string (2 digits)
 */
async function extractExamId(digitBoxes) {
  const digit1 = await extractDigitFromImage(digitBoxes[0]);
  const digit2 = await extractDigitFromImage(digitBoxes[1]);
  return `${digit1}${digit2}`;
}

/**
 * Extract scores from question score boxes
 * @param {Array<Buffer>} scoreBoxes - Array of score box image buffers
 * @returns {Promise<Array<number>>} Array of scores
 */
async function extractScores(scoreBoxes) {
  const scores = [];
  for (let i = 0; i < scoreBoxes.length; i++) {
    const score = await extractNumberFromImage(scoreBoxes[i]);
    // Clamp score between 0 and 100
    scores.push(Math.max(0, Math.min(100, score)));
  }
  return scores;
}

export {
  extractNumberFromImage,
  extractStudentNumber,
  extractExamId,
  extractScores,
  extractStudentIdFromImage,
};
