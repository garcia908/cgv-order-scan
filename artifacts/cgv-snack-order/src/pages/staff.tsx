import { Download, QrCode, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useClerk, useUser } from '@clerk/react';

export default function Staff() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const qrUrl = `${window.location.origin}${basePath}/`;

  const copyQrUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast.success('Link QR berhasil disalin');
    } catch (error) {
      console.error('Could not copy the auditorium QR link.', error);
      toast.error('Link QR gagal disalin');
    }
  };

  const downloadQr = () => {
    const svg = document.getElementById('auditorium-qr-code');
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-cgv-snack-bar-auditorium.svg';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('QR auditorium berhasil diunduh');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CGV Snack Bar</h1>
            <p className="text-muted-foreground">Pengaturan QR auditorium</p>
            {user?.primaryEmailAddress?.emailAddress && (
              <p className="mt-1 text-xs text-muted-foreground">
                {user.primaryEmailAddress.emailAddress}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => signOut({ redirectUrl: '/' })}>
            Keluar
          </Button>
        </div>

        <div
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"
        >
          <h2 className="font-bold">Mode notifikasi Telegram</h2>
          <p className="mt-1 text-sm">
            Pesanan dikirim ke Telegram dan tidak disimpan di dashboard. Riwayat,
            perubahan status, statistik, dan export pesanan tidak tersedia.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Barcode Auditorium</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Satu barcode ini dipasang di pintu auditorium dan berlaku untuk
                semua pengunjung.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => void copyQrUrl()}>
                  <Copy className="w-4 h-4 mr-2" /> Salin Link
                </Button>
                <Button onClick={downloadQr}>
                  <Download className="w-4 h-4 mr-2" /> Unduh QR
                </Button>
              </div>
              <p className="mt-3 break-all text-xs text-muted-foreground">{qrUrl}</p>
            </div>
            <div className="shrink-0 self-center rounded-xl border border-border bg-white p-3">
              <QRCodeSVG
                id="auditorium-qr-code"
                value={qrUrl}
                size={150}
                includeMargin
                aria-label="Barcode auditorium CGV Snack Bar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
