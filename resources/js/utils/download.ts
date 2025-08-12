export async function downloadBlob(url: string, filename: string) {
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include', // kirim cookie session
        headers: { Accept: 'application/pdf' },
    });
    if (!res.ok) throw new Error(`Gagal unduh (${res.status})`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
}
