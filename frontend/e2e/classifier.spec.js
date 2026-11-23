import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLES_DIR = path.resolve(__dirname, "../../sample_images");
const LABELS_CSV_PATH = path.join(SAMPLES_DIR, "labels.csv");

function loadGroundTruth() {
  const map = {};
  if (fs.existsSync(LABELS_CSV_PATH)) {
    const lines = fs.readFileSync(LABELS_CSV_PATH, "utf-8").split("\n");
    for (const line of lines) {
      const [file, cls] = line.trim().split(",");
      if (file && cls && file !== "file") {
        map[file] = cls;
      }
    }
  }
  return map;
}

test.describe("AI Fish Image Classifier E2E Suite", () => {
  test("1. Viewport 375px: tidak ada scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    for (const url of ["/", "/klasifikasi", "/riwayat", "/tentang-model"]) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      if (dimensions.scrollWidth > dimensions.clientWidth) {
        const overflowing = await page.evaluate(() => {
          const els = [];
          for (const el of document.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth) {
              els.push({ tag: el.tagName, class: el.className, right: r.right, text: el.textContent?.slice(0, 30) });
            }
          }
          return els;
        });
        console.log(`Horizontal overflow on ${url}: scrollWidth=${dimensions.scrollWidth} > clientWidth=${dimensions.clientWidth}`, overflowing);
      }

      expect(
        dimensions.scrollWidth,
        `Horizontal scroll detected on ${url}: scrollWidth=${dimensions.scrollWidth} > clientWidth=${dimensions.clientWidth}`
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });

  test("2. Console error monitor pada alur utama", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto("/klasifikasi");
    await page.waitForLoadState("networkidle");

    const samplePath = path.join(SAMPLES_DIR, "sample_format_test.jpg");
    await page.locator('input[type="file"]').setInputFiles(samplePath);

    await page.locator("button:has-text('Klasifikasikan')").click();
    await page.waitForSelector("h2:has-text('Hasil Analisis')", { timeout: 15000 });

    expect(consoleErrors).toEqual([]);
  });

  test("3. Aksesibilitas WCAG (axe-core) pada halaman utama", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const homeResults = await new AxeBuilder({ page }).analyze();
    const criticalHome = homeResults.violations.filter((v) => ["critical", "serious"].includes(v.impact));
    if (criticalHome.length > 0) {
      console.log("Axe violations on /:", JSON.stringify(criticalHome.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.html) })), null, 2));
    }
    expect(criticalHome).toEqual([]);

    await page.goto("/klasifikasi");
    await page.waitForLoadState("networkidle");
    const classResults = await new AxeBuilder({ page }).analyze();
    const criticalClass = classResults.violations.filter((v) => ["critical", "serious"].includes(v.impact));
    if (criticalClass.length > 0) {
      console.log("Axe violations on /klasifikasi:", JSON.stringify(criticalClass.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.html) })), null, 2));
    }
    expect(criticalClass).toEqual([]);
  });

  test("4. Pemeriksaan 8.4: Unggah JPG, PNG, WebP via UI vs respons API /predict", async ({ page, request }) => {
    test.setTimeout(90000);
    const groundTruth = loadGroundTruth();
    const testFiles = [
      "sample_format_test.jpg",
      "sample_format_test.webp",
      "fish_000000999597_05000.png",
      "fish_001348000118_01315.png",
      "fish_000027080001_02818.png",
      "fish_004548357375_11256.png",
      "fish_000024219597_05209.png",
      "fish_004131656765_26217.png",
      "fish_000023860001_02342.png",
      "fish_004543607366_23109.png",
    ];

    let parityMatches = 0;
    let accuratePredictions = 0;
    const reportRows = [];

    for (const fileName of testFiles) {
      const filePath = path.join(SAMPLES_DIR, fileName);
      if (!fs.existsSync(filePath)) continue;

      const ext = path.extname(fileName).toLowerCase();
      const mime = ext === ".jpg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "image/png";

      // 1. Direct API call
      const fileBuffer = fs.readFileSync(filePath);
      const apiResp = await request.post("/api/v1/predict", {
        multipart: {
          file: {
            name: fileName,
            mimeType: mime,
            buffer: fileBuffer,
          },
        },
        headers: { "X-Client-Id": "e2e-parity-client" },
      });
      expect(apiResp.ok()).toBeTruthy();
      const apiData = await apiResp.json();

      // 2. UI flow
      await page.goto("/klasifikasi");
      await page.locator('input[type="file"]').setInputFiles(filePath);

      await page.locator("button:has-text('Klasifikasikan')").click();
      await page.waitForSelector("h2:has-text('Hasil Analisis')", { timeout: 15000 });

      // Read UI displayed values
      const uiClass = (await page.locator('[data-testid="predicted-class"]').textContent()).trim();
      const uiConfidence = (await page.locator('[data-testid="predicted-confidence"]').textContent()).trim();

      const expectedConfidencePct =
        (apiData.confidence * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";

      // Verify UI Top 5
      const expectedTop5 = apiData.top_predictions ?? apiData.top5 ?? [];
      const uiRows = await page.locator('[data-testid="probability-bar-row"]').all();
      expect(uiRows.length).toBe(expectedTop5.length);

      let top5Match = true;
      for (let i = 0; i < expectedTop5.length; i++) {
        const rowLabel = (await uiRows[i].locator('[data-testid="probability-label"]').textContent())
          .replace(/^\d+\.\s*/, "")
          .trim();
        const rowVal = (await uiRows[i].locator('[data-testid="probability-value"]').textContent()).trim();

        const apiPct = expectedTop5[i].confidence * 100;
        const expectedBarVal =
          apiPct < 0.05 ? "<0,1%" : apiPct.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%";

        if (rowLabel !== expectedTop5[i].class_name || rowVal !== expectedBarVal) {
          top5Match = false;
        }
      }

      // Parity check
      const classParity = uiClass === apiData.predicted_class;
      const confParity = uiConfidence === expectedConfidencePct;
      const fullParity = classParity && confParity && top5Match;

      if (fullParity) parityMatches++;

      const trueClass = groundTruth[fileName] || (fileName.includes("fish_") ? "fish_01" : "N/A");
      const isCorrect = apiData.predicted_class === trueClass;
      if (isCorrect) accuratePredictions++;

      reportRows.push({
        file: fileName,
        format: ext.replace(".", "").toUpperCase(),
        trueClass,
        apiClass: apiData.predicted_class,
        uiClass,
        conf: `${expectedConfidencePct} (UI: ${uiConfidence})`,
        top5Parity: top5Match ? "MATCH" : "DIFF",
        parity: fullParity ? "MATCH" : "DIFF",
        groundTruthMatch: isCorrect ? "CORRECT" : `WRONG (pred ${apiData.predicted_class} vs true ${trueClass})`,
      });

      expect(classParity).toBeTruthy();
      expect(confParity).toBeTruthy();
      expect(top5Match).toBeTruthy();
    }

    console.log("\n==================== PEMERIKSAAN 8.4 UI vs API PARITY REPORT ====================");
    console.table(reportRows);
    console.log(`UI vs API Parity: ${parityMatches}/${testFiles.length} cocok sempurna.`);
    console.log(`Ground Truth Accuracy on Tested Sample: ${accuratePredictions}/${testFiles.length} (${((accuratePredictions / testFiles.length) * 100).toFixed(1)}%).`);
    console.log("=================================================================================\n");

    expect(parityMatches).toBe(testFiles.length);
  });

  test("5. Riwayat & Feedback flow", async ({ page }) => {
    await page.goto("/klasifikasi");
    const filePath = path.join(SAMPLES_DIR, "sample_format_test.jpg");
    await page.locator('input[type="file"]').setInputFiles(filePath);

    await page.locator("button:has-text('Klasifikasikan')").click();
    await page.waitForSelector("h2:has-text('Hasil Analisis')", { timeout: 15000 });

    // Submit feedback
    const btnFeedback = page.locator("button:has-text('Prediksi Benar')");
    if (await btnFeedback.isVisible()) {
      await btnFeedback.click();
      await expect(page.locator("text=Terima kasih atas umpan balik Anda!")).toBeVisible();
    }

    // Go to Riwayat
    await page.goto("/riwayat");
    await page.waitForSelector(".data-table");
    const rows = await page.locator(".data-table tbody tr").count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test("6. Screenshot capture final", async ({ page }) => {
    // Desktop screenshots
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/");
    await page.waitForSelector("h1");
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-desktop-home.png") });

    await page.goto("/klasifikasi");
    await page.waitForSelector("h1:has-text('Klasifikasi Ikan')");
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-desktop-klasifikasi.png") });

    const filePath = path.join(SAMPLES_DIR, "sample_format_test.jpg");
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.locator("button:has-text('Klasifikasikan')").click();
    await page.waitForSelector("h2:has-text('Hasil Analisis')", { timeout: 15000 });
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-desktop-result.png") });

    await page.goto("/riwayat");
    await page.waitForSelector("h1:has-text('Riwayat Prediksi')");
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-desktop-riwayat.png") });

    await page.goto("/tentang-model");
    await page.waitForSelector("h1");
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-desktop-about.png") });

    // Mobile screenshots
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto("/");
    await page.waitForSelector("h1");
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-mobile-home.png") });

    await page.goto("/klasifikasi");
    await page.waitForSelector("h1:has-text('Klasifikasi Ikan')");
    await page.screenshot({ path: path.resolve(__dirname, "../../docs/screenshots/final-mobile-klasifikasi.png") });
  });
});
