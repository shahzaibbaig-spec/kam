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
            display: grid;
            grid-template-rows: auto auto auto 1fr auto;
            gap: 0.8mm;
            padding: 1.4mm;
            border: 1px solid var(--line);
            border-radius: 2.2mm;
            background: var(--surface);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
            overflow: hidden;
        }

        .label-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 6px;
        }

        .system-name {
            margin: 0;
            font-size: 2.1mm;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent);
        }

        .tag-number {
            margin: 0;
            font-size: 2.2mm;
            font-weight: 700;
            color: var(--ink);
            text-align: right;
            word-break: break-word;
        }

        .asset-name {
            margin: 0;
            font-size: 2.9mm;
            line-height: 1.15;
            font-weight: 700;
            color: var(--ink);
            word-break: break-word;
        }

        .context-line {
            margin: 0;
            font-size: 2.1mm;
            line-height: 1.25;
            color: var(--muted);
            word-break: break-word;
        }

        .codes {
            display: grid;
            gap: 0.8mm;
            align-items: stretch;
            margin-top: 0.4mm;
        }

        .codes.codes-split {
            grid-template-columns: 2fr 1fr;
        }

        .codes.codes-single {
            grid-template-columns: 1fr;
        }

        .barcode-panel,
        .qr-panel {
            border: 0.2mm solid var(--line);
            border-radius: 1mm;
            padding: 0.6mm;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 9mm;
            overflow: hidden;
            background: #ffffff;
        }

        .barcode-panel svg {
            display: block;
            width: 100%;
            height: 100%;
        }

        .qr-panel svg {
            display: block;
            width: 100%;
            height: auto;
            max-height: 100%;
        }

        .label-footer {
            margin: 0;
            padding-top: 0.5mm;
            border-top: 0.2mm dashed var(--line);
            font-size: 1.9mm;
            line-height: 1.25;
            color: var(--muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        body.compact-layout .label {
            padding: 1mm;
            gap: 0.5mm;
        }

        body.compact-layout .asset-name {
            font-size: 2.5mm;
        }

        body.compact-layout .context-line {
            font-size: 1.9mm;
        }

        body.compact-layout .barcode-panel,
        body.compact-layout .qr-panel {
            min-height: 7mm;
            padding: 0.4mm;
        }

        body.compact-layout .label-footer {
            font-size: 1.7mm;
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
                width: calc(var(--label-width) - (var(--print-margin) * 2));
                height: calc(var(--label-height) - (var(--print-margin) * 2));
                min-height: 0;
                margin: var(--print-margin);
                border: 0;
                border-radius: 0;
                box-shadow: none;
                page-break-after: always;
                break-after: page;
            }

            .label:last-child {
                page-break-after: auto;
                break-after: auto;
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
                <div class="label-header">
                    <p class="system-name">Hospital Asset</p>
                    <p class="tag-number">{{ $label['tag_number'] ?? 'Tag pending' }}</p>
                </div>

                <h2 class="asset-name">{{ $label['asset_name'] }}</h2>

                @if ($contextParts !== [])
                    <p class="context-line">{{ implode(' / ', $contextParts) }}</p>
                @endif

                @if ($hasBarcode || $hasQr)
                    <div class="codes {{ $hasBarcode && $hasQr ? 'codes-split' : 'codes-single' }}">
                        @if ($hasBarcode)
                            <div class="barcode-panel">{!! $label['barcode_svg'] !!}</div>
                        @endif

                        @if ($hasQr)
                            <div class="qr-panel">{!! $label['qr_svg'] !!}</div>
                        @endif
                    </div>
                @endif

                @if ($labelFooter !== '')
                    <p class="label-footer">{{ $labelFooter }}</p>
                @endif
            </article>
        @endforeach
    </div>
</body>
</html>
