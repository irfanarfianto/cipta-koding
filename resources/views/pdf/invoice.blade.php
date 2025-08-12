<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Invoice {{ $invoice->invoice_code }}</title>
  <style>
    /* DomPDF safe styles */
    @page { margin: 28px 28px 40px 28px; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color:#111827; }
    .row { display: table; width: 100%; }
    .col { display: table-cell; vertical-align: top; }
    .mb-1{margin-bottom:6px} .mb-2{margin-bottom:8px} .mb-3{margin-bottom:12px} .mb-4{margin-bottom:16px}
    .right{text-align:right} .center{text-align:center} .bold{font-weight:700} .muted{color:#6b7280}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
    th{background:#f9fafb;text-align:left}
    .h1{font-size:20px;font-weight:700}
    .h2{font-size:16px;font-weight:700}
    .small{font-size:11px}
  </style>
</head>
<body>
  {{-- Header --}}
  <div class="row mb-3">
    <div class="col" style="width:60%">
      <div class="h1">INVOICE</div>
      <div class="mb-1">No: <strong>{{ $invoice->invoice_code }}</strong></div>
      @if($invoice->type)
        <div class="mb-1 small">Tipe: <strong style="text-transform:uppercase">{{ $invoice->type }}</strong></div>
      @endif
      <div class="small muted">
        Tanggal: {{ \Carbon\Carbon::parse($invoice->created_at)->translatedFormat('d F Y') }}<br>
        Jatuh Tempo: {{ \Carbon\Carbon::parse($invoice->due_date)->translatedFormat('d F Y') }}
      </div>
    </div>
    <div class="col right" style="width:40%">
      {{-- Identitas perusahaan, sesuaikan --}}
      <div class="h2">Cipta Koding</div>
      <div class="small">Jl. Contoh No. 1, Jakarta</div>
      <div class="small">finance@ciptakoding.com • 021-123456</div>
      <div class="small">NPWP: 01.234.567.8-999.000</div>
    </div>
  </div>

  {{-- Kepada --}}
  <div class="mb-3">
    <div class="bold">Kepada:</div>
    <div>{{ $order->client->name ?? '-' }}</div>
    @if(!empty($order->client->email)) <div class="small muted">{{ $order->client->email }}</div> @endif
    @if(!empty($order->client->phone_number)) <div class="small muted">{{ $order->client->phone_number }}</div> @endif
  </div>

  {{-- Items Order --}}
  <table class="mb-3">
    <thead>
      <tr>
        <th style="width:45%">Deskripsi</th>
        <th class="right" style="width:10%">Qty</th>
        <th class="right" style="width:20%">Harga</th>
        <th class="right" style="width:25%">Subtotal</th>
      </tr>
    </thead>
    <tbody>
    @forelse ($items as $row)
      @php
        $name = $row->item->name ?? ($row->name ?? 'Item');
        $qty = (int) $row->quantity;
        $price = (int) $row->price;
        $sub = $qty * $price;
      @endphp
      <tr>
        <td>{{ $name }}</td>
        <td class="right">{{ number_format($qty, 0, ',', '.') }}</td>
        <td class="right">Rp {{ number_format($price, 0, ',', '.') }}</td>
        <td class="right">Rp {{ number_format($sub, 0, ',', '.') }}</td>
      </tr>
    @empty
      <tr>
        <td colspan="4" class="muted">Tidak ada item pada order ini.</td>
      </tr>
    @endforelse
    </tbody>
  </table>

  {{-- Ringkasan Order --}}
  <table class="mb-3">
    <tr>
      <td class="right">Subtotal Order</td>
      <td class="right" style="width:180px">Rp {{ number_format($orderSubtotal, 0, ',', '.') }}</td>
    </tr>
    @if(!is_null($order->discount_amount ?? null))
    <tr>
      <td class="right">Diskon</td>
      <td class="right">- Rp {{ number_format((int)$order->discount_amount, 0, ',', '.') }}</td>
    </tr>
    @endif
    {{-- Tambah baris pajak/biaya lain jika ada --}}
    <tr>
      <td class="right bold">Total Order (Final)</td>
      <td class="right bold">Rp {{ number_format($orderFinal, 0, ',', '.') }}</td>
    </tr>
    <tr>
      <td class="right">Sudah Dibayar (semua invoice)</td>
      <td class="right">Rp {{ number_format($orderPaid, 0, ',', '.') }}</td>
    </tr>
    <tr>
      <td class="right">Sisa Tertagih (order)</td>
      <td class="right">Rp {{ number_format($orderDue, 0, ',', '.') }}</td>
    </tr>
  </table>

  {{-- Rincian Invoice Ini --}}
  <div class="bold mb-1">Rincian Invoice Ini</div>
  <table class="mb-4">
    <tr>
      <td>Nominal Invoice</td>
      <td class="right" style="width:180px">Rp {{ number_format((int)$invoice->amount, 0, ',', '.') }}</td>
    </tr>
    <tr>
      <td>Sudah Dibayar (invoice ini)</td>
      <td class="right">Rp {{ number_format($thisInvoicePaid, 0, ',', '.') }}</td>
    </tr>
    <tr>
      <td class="bold">Sisa (invoice ini)</td>
      <td class="right bold">Rp {{ number_format($thisInvoiceRemaining, 0, ',', '.') }}</td>
    </tr>
    @if($invoice->type === 'dp')
    <tr>
      <td class="muted small" colspan="2">* Ini adalah tagihan DP. Pelunasan akan menagih sisa dari total proyek.</td>
    </tr>
    @endif
  </table>

  <div class="small muted">
    Pembayaran ke: Bank BCA • 1234567890 a.n Cipta Koding. Mohon mencantumkan nomor invoice pada berita transfer.
  </div>
</body>
</html>
