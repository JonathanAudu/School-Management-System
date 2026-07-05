<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Report Card - {{ $student->first_name }} {{ $student->last_name }}</title>
    <style>
        body { font-family: sans-serif; color: #333; line-height: 1.5; font-size: 14px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0 0 5px 0; font-size: 24px; color: #1a56db; }
        .header p { margin: 0; font-size: 14px; }
        .student-info { margin-bottom: 20px; display: table; width: 100%; }
        .student-info .col { display: table-cell; width: 50%; }
        .student-info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table, th, td { border: 1px solid #ddd; }
        th { background-color: #f3f4f6; text-align: left; padding: 10px; font-size: 12px; }
        td { padding: 8px 10px; font-size: 13px; text-align: center; }
        td.subject-name { text-align: left; font-weight: bold; }
        .summary { margin-top: 10px; }
        .summary-box { width: 40%; display: inline-block; vertical-align: top; }
        .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; text-align: center; }
        .signatures { margin-top: 50px; display: table; width: 100%; }
        .signatures .sign-box { display: table-cell; text-align: center; width: 33%; vertical-align: bottom; }
        .sign-line { border-bottom: 1px solid #000; display: inline-block; width: 80%; margin-bottom: 5px; }
        .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 400px; opacity: 0.1; z-index: -100; }
    </style>
</head>
<body>

    <img src="{{ public_path('images/logo.png') }}" class="watermark" alt="Watermark" />

    <div class="header">
        <h1>Lumina Academy</h1>
        <p>123 Education Lane, Knowledge City</p>
        <p><strong>Student Progress Report</strong></p>
    </div>

    <div class="student-info">
        <div class="col">
            <p><strong>Student Name:</strong> {{ $student->first_name }} {{ $student->middle_name }} {{ $student->last_name }}</p>
            <p><strong>Admission No:</strong> {{ $student->admission_number }}</p>
            <p><strong>Class:</strong> {{ $schoolClass->full_name }}</p>
        </div>
        <div class="col">
            <p><strong>Academic Session:</strong> {{ $session->name }}</p>
            <p><strong>Term:</strong> {{ $term->name }} ({{ str_replace('_', ' ', ucwords($term_type)) }})</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Subject</th>
                <th width="10%">CA 1</th>
                <th width="10%">CA 2</th>
                <th width="10%">Exam</th>
                <th width="10%">Total</th>
                <th width="10%">Grade</th>
                <th width="20%">Remark</th>
            </tr>
        </thead>
        <tbody>
            @foreach($results as $res)
            <tr>
                <td class="subject-name">{{ $res->subject->name ?? 'N/A' }}</td>
                <td>{{ isset($res->ca1) ? round($res->ca1) : '-' }}</td>
                <td>{{ isset($res->ca2) ? round($res->ca2) : '-' }}</td>
                <td>{{ isset($res->exam) ? round($res->exam) : '-' }}</td>
                <td><strong>{{ isset($res->total_score) ? round($res->total_score) : '-' }}</strong></td>
                <td><strong>{{ $res->grade ?? '-' }}</strong></td>
                <td>{{ $res->remark ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <div class="summary-box">
            <p><strong>Overall Performance Summary</strong></p>
            <p>Average: <strong>{{ number_format($average, 0) }}%</strong></p>
        </div>
    </div>

    <div class="signatures">
        <div class="sign-box">
            @if(isset($formMasterSignature) && $formMasterSignature)
                <img src="{{ public_path('storage/' . $formMasterSignature) }}" alt="Form Teacher Signature" style="max-width: 150px; max-height: 50px; display: block; margin: 0 auto 5px auto;" />
            @endif
            <div class="sign-line"></div>
            <p>Form Teacher's Signature</p>
        </div>
        <div class="sign-box">
            @if(isset($principalSignature) && $principalSignature)
                <img src="{{ public_path('storage/' . $principalSignature) }}" alt="Principal Signature" style="max-width: 150px; max-height: 50px; display: block; margin: 0 auto 5px auto;" />
            @else
                <img src="{{ public_path('images/signature.png') }}" alt="Principal Signature" style="max-width: 150px; max-height: 50px; display: block; margin: 0 auto 5px auto;" />
            @endif
            <div class="sign-line"></div>
            <p>Principal's Signature</p>
        </div>
    </div>

    <div class="footer">
        <p>This report is auto-generated by the Lumina Academy School Management System.</p>
    </div>

</body>
</html>
