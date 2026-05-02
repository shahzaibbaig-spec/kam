<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dispensing Slip {{ $dispensing->dispensing_number }}</title>
    <style>
        @page { size: A4; margin: 18mm; }
        body { margin: 0; font-family: Arial, sans-serif; color: #0f172a; }
        .head { text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 12px; }
        .head h1 { margin: 0; font-size: 22px; }
        .head p { margin: 6px 0 0; font-size: 12px; color: #334155; }
        .meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
        .meta div { border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { border: 1px solid #e2e8f0; padding: 7px; text-align: left; }
        th { background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
        .foot { margin-top: 12px; font-size: 12px; color: #475569; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <div class="head">
        <h1>KORT Burn Center - Pharmacy Dispensing Slip</h1>
        <p>Dispensing #{{ $dispensing->dispensing_number }} | {{ optional($dispensing->dispensed_at)->format('d M Y h:i A') }}</p>
    </div>

    <div class="meta">
        <div><strong>Patient:</strong> {{ $dispensing->patient?->full_name }}</div>
        <div><strong>Patient No:</strong> {{ $dispensing->patient?->patient_number }}</div>
        <div><strong>CNIC:</strong> {{ $dispensing->patient?->cnic ?: 'Not recorded' }}</div>
        <div><strong>Prescription:</strong> {{ $dispensing->prescription?->prescription_number }}</div>
        <div><strong>Doctor:</strong> {{ $dispensing->prescription?->visit?->doctor?->name ?: 'Unknown' }}</div>
        <div><strong>Pharmacist:</strong> {{ $dispensing->pharmacist?->name ?: 'Unknown' }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Dispensed Qty</th>
                <th>Unit</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($dispensing->items as $item)
                <tr>
                    <td>{{ $item->inventoryItem?->item_name ?: $item->prescriptionItem?->medicine_name }}</td>
                    <td>{{ $item->batch_number ?: '-' }}</td>
                    <td>{{ optional($item->expiry_date)->format('d M Y') ?: '-' }}</td>
                    <td>{{ $item->dispensed_quantity }}</td>
                    <td>{{ $item->unit_of_measure }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="foot">
        <span>Status: {{ ucfirst($dispensing->status) }}</span>
        <span>Printed by: {{ $printedBy?->name ?: 'System' }}</span>
    </div>
</body>
</html>

