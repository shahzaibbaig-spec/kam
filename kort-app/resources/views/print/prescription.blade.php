<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prescription {{ $prescription->prescription_number }}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm 70mm;
        }

        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #0f172a;
            background: #fff;
        }

        .sheet {
            width: 100%;
            margin: 0;
            background: #fff;
            border: 0;
            border-radius: 0;
            padding: 0;
        }

        .toolbar {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 12px;
        }

        .print-btn {
            border: 0;
            background: #2563eb;
            color: #fff;
            border-radius: 999px;
            padding: 10px 14px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }

        .head {
            border-bottom: 2px solid #dbeafe;
            padding-bottom: 14px;
            margin-bottom: 12px;
            text-align: center;
        }

        .logo {
            display: block;
            margin: 0 auto 10px;
            width: 90px;
            height: auto;
        }

        .head h1 {
            margin: 0;
            font-size: 26px;
        }

        .head p {
            margin: 6px 0 0;
            color: #334155;
            font-size: 13px;
        }

        .head .doctor-line {
            margin-top: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 12px;
        }

        .cell {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 10px;
        }

        .cell .k {
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        .cell .v {
            margin-top: 4px;
            font-size: 14px;
            font-weight: 600;
        }

        .section {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
        }

        .section h2 {
            margin: 0 0 8px;
            font-size: 15px;
        }

        .section p {
            margin: 0;
            line-height: 1.5;
            color: #334155;
            white-space: pre-wrap;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        th, td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            vertical-align: top;
            text-align: left;
        }

        th {
            background: #f8fafc;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #475569;
        }

        .sign {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }

        .sign-box {
            width: 240px;
            border-top: 1px solid #0f172a;
            padding-top: 8px;
            text-align: center;
            font-size: 13px;
            color: #334155;
        }

        .foot {
            margin-top: 14px;
            font-size: 12px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
        }

        @media print {
            body { background: #fff; }
            .sheet {
                border: 0;
                border-radius: 0;
                padding: 0;
                max-width: 100%;
            }
            .toolbar { display: none; }
        }
    </style>
</head>
<body>
    @php
        $logoDataUri = null;
        $logoAbsolutePath = public_path('images/kort-logo.jpeg');
        if (is_file($logoAbsolutePath)) {
            $logoDataUri = 'data:image/jpeg;base64,'.base64_encode(file_get_contents($logoAbsolutePath));
        }
    @endphp

    <div class="sheet">
        <div class="toolbar">
            <button class="print-btn" onclick="window.print()">Print Prescription</button>
        </div>

        <div class="head">
            @if ($logoDataUri)
                <img src="{{ $logoDataUri }}" alt="KORT Burn Center Logo" class="logo" />
            @endif
            <h1>KORT Burn Center</h1>
            <p class="doctor-line">Doctor: {{ $prescription->doctor?->name ?: 'Not recorded' }}</p>
            <p>Prescription #{{ $prescription->prescription_number }} | Date {{ optional($prescription->prescription_date)->format('d M Y h:i A') }}</p>
        </div>

        <div class="grid">
            <div class="cell"><div class="k">Patient Name</div><div class="v">{{ $patient->full_name }}</div></div>
            <div class="cell"><div class="k">Patient Number</div><div class="v">{{ $patient->patient_number }}</div></div>
            <div class="cell"><div class="k">CNIC</div><div class="v">{{ $patient->cnic ?: 'Not recorded' }}</div></div>
            <div class="cell"><div class="k">Age / Gender</div><div class="v">{{ $patient->computed_age ?: ($patient->age ?: '-') }} / {{ ucfirst($patient->gender) }}</div></div>
            <div class="cell"><div class="k">Doctor</div><div class="v">{{ $prescription->doctor?->name ?: 'Not recorded' }}</div></div>
            <div class="cell"><div class="k">Visit</div><div class="v">{{ $visit?->visit_number ?: '-' }}</div></div>
        </div>

        <div class="section">
            <h2>Diagnosis Summary</h2>
            <p>{{ $diagnosisSummary ?: 'No diagnosis summary recorded.' }}</p>
        </div>

        <div class="section">
            <h2>Medicines</h2>
            <table>
                <thead>
                    <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($prescription->items as $item)
                        <tr>
                            <td>{{ $item->medicine_name }}</td>
                            <td>{{ $item->dosage }}</td>
                            <td>{{ $item->frequency }}</td>
                            <td>{{ $item->duration }}</td>
                            <td>{{ $item->instructions ?: '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>General Instructions / Advice</h2>
            <p>{{ $prescription->instructions ?: 'No extra instructions recorded.' }}</p>
            @if (filled($prescription->printable_notes))
                <p style="margin-top: 8px;"><strong>Notes:</strong> {{ $prescription->printable_notes }}</p>
            @endif
            <p style="margin-top: 8px;"><strong>Follow-up date:</strong> {{ optional($followUpDate)->format('d M Y') ?: 'Not specified' }}</p>
        </div>

        <div class="sign">
            <div class="sign-box">
                Doctor Signature
            </div>
        </div>

        <div class="foot">
            <span>Printed by: {{ $printedBy?->name ?: 'System' }}</span>
            <span>Printed at: {{ now()->format('d M Y h:i A') }}</span>
        </div>
    </div>
</body>
</html>
