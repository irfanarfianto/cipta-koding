<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Invoice {{ $invoice->invoice_code }}</title>
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color:#111827;}
    .mb-1{margin-bottom:6px}.mb-2{margin-bottom:8px}.mb-4{margin-bottom:16px}
    .right{text-align:right}.bold{font-weight:700}
    table{width:100%;border-collapse:collapse}
    th,td{padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
    th{background:#f9fafb;text-align:left}
    .muted{color:#6b7280}
  </style>
</head>
<body>
  <h2 class="mb-2">Invoice {{ $invoice->invoice_code }}</h2>

  <div class="mb-4">
    <div>Order: <strong>{{ $order->order_code ?? $order->id }}</strong></div>
    <div>Klien: <strong>{{ $order->client->name ?? '-' }}</strong></div>
    <div>Status Invoice: <strong>{{ $invoice->status }}</strong></div>
    <div>Jatuh Tempo: <strong>{{ \Carbon\Carbon::parse($invoice->due_date)->translatedFormat('d F Y') }}</strong></div>
  </div>

  {{-- Tabel Items Order --}}
  <table class="mb-4">
    <thead>
      <tr>
        <th style="width:45%">Item</th>
        <th class="right" style="width:10%">Qty</th>
        <th class="right" style="width:20%">Harga</th>
        <th class="right" style="width:25%">Subtotal</th>
      </tr>
    </thead>
    <tbody>
    @forelse ($items as $row)
      @php
        $name = $row->item->name ?? 'Item';
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
  <table class="mb-4">
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
    {{-- Tambahkan baris pajak/biaya lain di sini jika ada --}}
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
  <div class="mb-1"><strong>Rincian Invoice Ini</strong></div>
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
  </table>

  <div class="muted">Terima kasih.</div>
</body>
</html>
