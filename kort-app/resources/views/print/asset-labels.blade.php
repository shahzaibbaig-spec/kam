@php
    $labelWidthMm = max(20, min(120, (int) ($printSettings['label_width_mm'] ?? 50)));
    $labelHeightMm = max(15, min(120, (int) ($printSettings['label_height_mm'] ?? 25)));
    $printMarginMm = max(0, min(20, (int) ($printSettings['print_margin_mm'] ?? 2)));
    $labelFooter = trim((string) ($printSettings['label_footer'] ?? ''));
    $includeDepartment = (bool) ($printSettings['include_department'] ?? true);
    $includeLocation = (bool) ($printSettings['include_location'] ?? true);
    $barcodeEnabled = (bool) ($printSettings['barcode_enabled'] ?? true);
    $qrEnabled = (bool) ($printSettings['qr_enabled'] ?? true);
    $compactLayout = (bool) ($printSettings['compact_layout'] ?? false);
    $textMaxChars = 20;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        @page {
            size: {{ $labelWidthMm }}mm {{ $labelHeightMm }}mm;
            margin: 0;
        }

        :root {
            color-scheme: light;
            --label-width: {{ $labelWidthMm }}mm;
            --label-height: {{ $labelHeightMm }}mm;
            --print-margin: {{ $printMarginMm }}mm;
            --surface: #ffffff;
            --ink: #0f172a;
            --muted: #475569;
            --line: #cbd5e1;
            --accent: #1d4ed8;
            --canvas: #f8fafc;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 20px;
            font-family: "Segoe UI", Arial, sans-serif;
            color: var(--ink);
            background:
                radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 26%),
                var(--canvas);
        }

        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 18px;
        }

        .eyebrow {
            margin: 0;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--accent);
        }

        .title {
            margin: 8px 0 0;
            font-size: 24px;
            font-weight: 700;
            color: var(--ink);
        }

        .subtitle {
            margin: 8px 0 0;
            max-width: 700px;
            font-size: 13px;
            line-height: 1.5;
            color: var(--muted);
        }

        .print-button {
            border: 0;
            border-radius: 999px;
            background: #2563eb;
            color: #ffffff;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 12px 28px rgba(37, 99, 235, 0.18);
        }

        .label-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: flex-start;
        }

        .label {
            width: var(--label-width);
            min-height: var(--label-height);
            display: flex;
            flex-direction: column;
            gap: 0;
            padding: 1.2mm;
            border: 1px solid var(--line);
            border-radius: 2.2mm;
            background: var(--surface);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
            overflow: hidden;
        }

        .top-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1.1mm;
            min-height: 11.8mm;
        }

        .text-column {
            flex: 1 1 auto;
            min-width: 0;
        }

        .system-name {
            margin: 0;
            font-size: 1.9mm;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent);
        }

        .asset-name {
            margin: 0;
            margin-top: 0.6mm;
            font-size: 2.9mm;
            font-weight: 700;
            color: var(--ink);
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tag-number {
            margin: 0;
            margin-top: 0.4mm;
            font-size: 2.4mm;
            font-weight: 700;
            color: var(--ink);
            letter-spacing: 0.04em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .context-line {
            margin: 0;
            margin-top: 0.4mm;
            font-size: 1.8mm;
            line-height: 1.1;
            color: #111827;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .qr-panel {
            flex: 0 0 auto;
            width: 9.8mm;
            height: 9.8mm;
            border: 0.2mm solid #9ca3af;
            border-radius: 0.8mm;
            padding: 0.25mm;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #ffffff;
            overflow: hidden;
        }

        .qr-panel svg {
            display: block;
            width: 100%;
            height: 100%;
        }

        .barcode-panel {
            margin-top: auto;
            border: 0.2mm solid #9ca3af;
            border-radius: 0.8mm;
            padding: 0.35mm;
            height: 8.8mm;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background: #ffffff;
        }

        .barcode-panel svg {
            display: block;
            width: 100%;
            height: 100%;
        }

        .label-footer {
            margin: 0;
            margin-top: 0.5mm;
            padding-top: 0.3mm;
            border-top: 0.2mm dashed #9ca3af;
            font-size: 1.6mm;
            line-height: 1.1;
            color: #111827;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        body.compact-layout .label {
            padding: 1mm;
        }

        body.compact-layout .asset-name {
            font-size: 2.7mm;
        }

        body.compact-layout .context-line {
            font-size: 1.7mm;
        }

        body.compact-layout .barcode-panel {
            height: 8.2mm;
            padding: 0.25mm;
        }

        body.compact-layout .qr-panel {
            width: 9.2mm;
            height: 9.2mm;
            padding: 0.2mm;
        }

        body.compact-layout .label-footer {
            font-size: 1.5mm;
        }

        @media print {
            body {
                background: #ffffff;
                padding: 0;
            }

            .toolbar {
                display: none;
            }

            .label-grid {
                display: block;
            }

            .label {
                width: var(--label-width);
                height: var(--label-height);
                min-height: 0;
                margin: 0;
                border: 0;
                border-radius: 0;
                box-shadow: none;
                break-inside: avoid-page;
                page-break-inside: avoid;
            }

            .label + .label {
                page-break-before: always;
                break-before: page;
            }
        }
    </style>
</head>
<body class="{{ $compactLayout ? 'compact-layout' : '' }}">
    <div class="toolbar">
        <div>
            <p class="eyebrow">KORT Asset Management System</p>
            <h1 class="title">{{ $title }}</h1>
            <p class="subtitle">
                Print profile: {{ $labelWidthMm }} x {{ $labelHeightMm }} mm, margin {{ $printMarginMm }} mm.
                Barcode {{ $barcodeEnabled ? 'enabled' : 'disabled' }}, QR {{ $qrEnabled ? 'enabled' : 'disabled' }}.
            </p>
        </div>
        <button class="print-button" onclick="window.print()">Print</button>
    </div>

    <div class="label-grid">
        @foreach ($labels as $label)
            @php
                $assetName = trim((string) ($label['asset_name'] ?? ''));
                if ($assetName === '') {
                    $assetName = trim((string) ($label['asset_name_full'] ?? 'Asset'));
                }
                $assetName = mb_strimwidth($assetName, 0, $textMaxChars, '');

                $tagNumber = trim((string) ($label['tag_number'] ?? ''));
                if ($tagNumber === '') {
                    $tagNumber = trim((string) ($label['barcode_value'] ?? 'TAG-PENDING'));
                }
                $tagNumber = mb_strimwidth($tagNumber, 0, 24, '');

                $contextParts = [];

                if ($includeDepartment && filled($label['department_name'] ?? null)) {
                    $contextParts[] = $label['department_name'];
                }

                if ($includeLocation && filled($label['location_name'] ?? null)) {
                    $contextParts[] = $label['location_name'];
                }

                $hasBarcode = $barcodeEnabled && ! empty($label['barcode_svg']);
                $hasQr = $qrEnabled && ! empty($label['qr_svg']);
            @endphp
            <article class="label">
                <div class="top-row">
                    <div class="text-column">
                        <p class="system-name">Hospital Asset</p>
                        <h2 class="asset-name">{{ $assetName !== '' ? $assetName : 'Asset' }}</h2>
                        <p class="tag-number">{{ $tagNumber !== '' ? $tagNumber : 'TAG-PENDING' }}</p>
                        @if ($contextParts !== [])
                            <p class="context-line">{{ implode(' / ', $contextParts) }}</p>
                        @endif
                    </div>
                    @if ($hasQr)
                        <div class="qr-panel">{!! $label['qr_svg'] !!}</div>
                    @endif
                </div>

                @if ($hasBarcode)
                    <div class="barcode-panel">{!! $label['barcode_svg'] !!}</div>
                @endif

                @if ($labelFooter !== '')
                    <p class="label-footer">{{ $labelFooter }}</p>
                @elseif (! $hasBarcode && ! $hasQr)
                    <div class="label-footer">Barcode/QR unavailable for this asset.</div>
                @endif
            </article>
        @endforeach
    </div>
@if (($printMode ?? false) === true)
    <script>
        window.addEventListener('load', function () {
            window.setTimeout(function () {
                window.print();
            }, 120);
        }, { once: true });

        window.addEventListener('afterprint', function () {
            if (window.opener) {
                window.close();
            }
        });
    </script>
@endif
</body>
</html>
