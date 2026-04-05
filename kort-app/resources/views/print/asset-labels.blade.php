<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        :root {
            color-scheme: light;
            --blue-700: #1d4ed8;
            --blue-600: #2563eb;
            --blue-50: #eff6ff;
            --slate-950: #0f172a;
            --slate-700: #334155;
            --slate-500: #64748b;
            --slate-200: #e2e8f0;
            --slate-100: #f1f5f9;
            --white: #ffffff;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 28px;
            font-family: "Segoe UI", Arial, sans-serif;
            background:
                radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 28%),
                #f8fbff;
            color: var(--slate-950);
        }

        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 24px;
        }

        .eyebrow {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: var(--blue-700);
        }

        .title {
            margin: 10px 0 0;
            font-size: 28px;
            font-weight: 700;
            color: var(--slate-950);
        }

        .subtitle {
            margin: 8px 0 0;
            max-width: 700px;
            font-size: 14px;
            line-height: 1.6;
            color: var(--slate-500);
        }

        .print-button {
            border: 0;
            border-radius: 999px;
            background: var(--blue-600);
            color: var(--white);
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 18px 36px rgba(37, 99, 235, 0.16);
        }

        .label-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 18px;
        }

        .label {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
            border: 1px solid rgba(37, 99, 235, 0.12);
            border-radius: 24px;
            padding: 18px;
            break-inside: avoid;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
        }

        .label-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
        }

        .label-chip {
            display: inline-flex;
            align-items: center;
            border: 1px solid rgba(37, 99, 235, 0.12);
            background: var(--blue-50);
            color: var(--blue-700);
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
        }

        .asset-name {
            margin: 12px 0 0;
            font-size: 18px;
            font-weight: 700;
        }

        .meta {
            margin-top: 6px;
            font-size: 12px;
            line-height: 1.6;
            color: var(--slate-500);
        }

        .code-blocks {
            display: grid;
            grid-template-columns: 1.3fr 0.7fr;
            gap: 14px;
            margin-top: 16px;
        }

        .code-panel {
            background: var(--white);
            border: 1px solid var(--slate-200);
            border-radius: 18px;
            padding: 14px;
            text-align: center;
        }

        .code-label {
            margin: 0 0 10px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--slate-500);
        }

        .code-panel svg {
            max-width: 100%;
            height: auto;
        }

        @media print {
            body {
                background: var(--white);
                padding: 0;
            }

            .toolbar {
                display: none;
            }

            .label-grid {
                gap: 10px;
            }

            .label {
                box-shadow: none;
                border-radius: 0;
                border-color: #cbd5e1;
            }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <div>
            <div class="eyebrow">KORT Assest Managment System</div>
            <h1 class="title">{{ $title }}</h1>
            <p class="subtitle">
                Print-ready asset labels for hospital equipment identification, tag verification, and ward-level asset accountability.
            </p>
        </div>
        <button class="print-button" onclick="window.print()">Print</button>
    </div>

    <div class="label-grid">
        @foreach ($labels as $label)
            <article class="label">
                <div class="label-header">
                    <div>
                        <div class="eyebrow">KORT Assest Managment System</div>
                        <h2 class="asset-name">{{ $label['asset_name'] }}</h2>
                        <div class="meta">{{ $label['tag_number'] ?? 'Tag pending' }}</div>
                        @if ($label['department_name'] || $label['location_name'])
                            <div class="meta">
                                {{ implode(' / ', array_filter([$label['department_name'], $label['location_name']])) }}
                            </div>
                        @endif
                    </div>
                    <span class="label-chip">Hospital Asset</span>
                </div>

                <div class="code-blocks">
                    @if ($label['barcode_svg'])
                        <div class="code-panel">
                            <p class="code-label">Barcode</p>
                            {!! $label['barcode_svg'] !!}
                        </div>
                    @endif

                    @if ($label['qr_svg'])
                        <div class="code-panel">
                            <p class="code-label">QR</p>
                            {!! $label['qr_svg'] !!}
                        </div>
                    @endif
                </div>
            </article>
        @endforeach
    </div>
</body>
</html>
