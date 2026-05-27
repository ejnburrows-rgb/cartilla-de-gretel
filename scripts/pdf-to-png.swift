#!/usr/bin/env swift
/**
 * scripts/pdf-to-png.swift
 *
 * Renders every page of a PDF to individual PNG files using
 * macOS PDFKit + Core Graphics. This is a faithful, pixel-accurate
 * reproduction — no generative AI, no colour changes, no art alteration.
 *
 * Usage:
 *   swift scripts/pdf-to-png.swift <input.pdf> <output-dir> [dpi]
 *
 * Arguments:
 *   input.pdf    Path to the source PDF.
 *   output-dir   Directory to write page-001.png, page-002.png, …
 *   dpi          Render resolution in dots-per-inch (default: 300).
 *
 * Output files:
 *   <output-dir>/page-001.png
 *   <output-dir>/page-002.png
 *   …
 *
 * Exit codes:
 *   0 = success
 *   1 = argument error
 *   2 = PDF load failure
 *   3 = render error
 */

import Foundation
import PDFKit
import CoreGraphics
import ImageIO

// ── Args ────────────────────────────────────────────────────────────────────

let argv = CommandLine.arguments
guard argv.count >= 3 else {
    fputs("Usage: pdf-to-png.swift <input.pdf> <output-dir> [dpi]\n", stderr)
    exit(1)
}

let pdfPath  = argv[1]
let outDir   = argv[2]
let dpi      = argv.count >= 4 ? Double(argv[3]) ?? 300.0 : 300.0
let scale    = dpi / 72.0   // PDF points are 72 per inch

// ── Load PDF ─────────────────────────────────────────────────────────────────

guard let pdfURL = URL(string: "file://" + pdfPath.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed)!),
      let pdfDoc = PDFDocument(url: pdfURL) else {
    fputs("❌  Cannot open PDF: \(pdfPath)\n", stderr)
    exit(2)
}

let pageCount = pdfDoc.pageCount
fputs("   \(pageCount) pages — DPI \(Int(dpi)) — scale \(String(format: "%.4f", scale))×\n", stderr)

// ── Ensure output directory ───────────────────────────────────────────────────

try? FileManager.default.createDirectory(atPath: outDir,
                                         withIntermediateDirectories: true,
                                         attributes: nil)

// ── Render ───────────────────────────────────────────────────────────────────

for i in 0 ..< pageCount {
    let pageNum = i + 1
    guard let page = pdfDoc.page(at: i) else {
        fputs("   ⚠️  page \(pageNum): nil\n", stderr)
        continue
    }

    let bounds  = page.bounds(for: .mediaBox)
    let w       = Int(ceil(bounds.width  * scale))
    let h       = Int(ceil(bounds.height * scale))

    // Create RGB context (no alpha — white background)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
        data: nil,
        width: w, height: h,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
    ) else {
        fputs("   ❌  page \(pageNum): cannot create CGContext\n", stderr)
        exit(3)
    }

    // White background
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))

    // Scale from PDF points → pixels
    ctx.scaleBy(x: CGFloat(scale), y: CGFloat(scale))

    // PDFKit renders with Y-axis flipped relative to CG; correct here
    ctx.translateBy(x: 0, y: bounds.height)
    ctx.scaleBy(x: 1, y: -1)

    // Draw the page
    page.draw(with: .mediaBox, to: ctx)

    guard let cgImage = ctx.makeImage() else {
        fputs("   ❌  page \(pageNum): makeImage failed\n", stderr)
        exit(3)
    }

    // Write PNG
    let numStr   = String(format: "%03d", pageNum)
    let outPath  = "\(outDir)/page-\(numStr).png"
    let outURL   = URL(fileURLWithPath: outPath)
    guard let dest = CGImageDestinationCreateWithURL(outURL as CFURL, "public.png" as CFString, 1, nil) else {
        fputs("   ❌  page \(pageNum): cannot create destination\n", stderr)
        exit(3)
    }

    // Set PNG metadata: embed DPI so downstream tools know the resolution
    let pixelsPerMeter = Int((dpi / 0.0254).rounded())
    let meta: [String: Any] = [
        kCGImagePropertyPNGXPixelsPerMeter as String: pixelsPerMeter,
        kCGImagePropertyPNGYPixelsPerMeter as String: pixelsPerMeter,
    ]
    let props: [String: Any] = [kCGImagePropertyPNGDictionary as String: meta]

    CGImageDestinationAddImage(dest, cgImage, props as CFDictionary)
    CGImageDestinationFinalize(dest)

    let kbSize = (try? FileManager.default.attributesOfItem(atPath: outPath)[.size] as? Int).flatMap { $0 } ?? 0
    fputs("   ✓  page \(pageNum)/\(pageCount)  \(w)×\(h)px  \(kbSize / 1024)KB\n", stderr)
}

fputs("✅  Done.\n", stderr)
// Print output dir to stdout so the caller can read it
print(outDir)
