import { useState } from 'react';
import { formatRupiah } from '@/lib/format';
import { Download, Trash2, CheckCircle2, Clock, ChefHat, Loader2, RefreshCw, QrCode, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import {
  useListOrders,
  useUpdateOrderStatus,
  useClearOrders,
  useGetOrdersSummary,
  getListOrdersQueryKey,
  getGetOrdersSummaryQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Order, OrderStatus } from '@workspace/api-client-react';
import { useClerk, useUser } from '@clerk/react';

export default function Staff() {
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: orders = [], isLoading, refetch, isFetching } = useListOrders({
    query: { queryKey: getListOrdersQueryKey(), refetchInterval: 5000 },
  });
  const { data: summary } = useGetOrdersSummary({
    query: { queryKey: getGetOrdersSummaryQueryKey(), refetchInterval: 5000 },
  });
  const updateStatus = useUpdateOrderStatus();
  const clearOrders = useClearOrders();

  const [statusFilter, setStatusFilter] = useState<'semua'|'baru'|'disiapkan'|'selesai'>('semua');

  const filteredOrders = orders.filter(o => statusFilter === 'semua' || o.status === statusFilter);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const qrUrl = `${window.location.origin}${basePath}/`;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetOrdersSummaryQueryKey() });
  };

  const handleStatusChange = (id: number, status: OrderStatus) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          invalidate();
          toast.success(`Pesanan ditandai ${status}`);
        },
        onError: () => toast.error('Gagal memperbarui status'),
      },
    );
  };

  const exportCSV = () => {
    let csv = "Order ID,Waktu,Kursi,Auditorium,Atas Nama,Status,Metode Bayar,Uang Cash,Kembalian,Total,Items\n";
    orders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleString('id-ID');
      const itemsStr = o.items.map(i => `${i.qty}x ${i.name}`).join('; ');
      const cashReceived = o.cashReceived ?? '';
      const change = o.cashReceived ? o.cashReceived - o.total : '';
      csv += `${o.orderCode},"${date}",${o.seatNumber},${o.auditorium},"${o.customerName}",${o.status},${paymentLabel(o.paymentMethod)},${cashReceived},${change},${o.total},"${itemsStr}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cgv-pesanan-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File CSV berhasil didownload');
  };

  const copyQrUrl = async () => {
    await navigator.clipboard.writeText(qrUrl);
    toast.success('Link QR berhasil disalin');
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

  const handleClearAll = () => {
    clearOrders.mutate(undefined, {
      onSuccess: () => {
        invalidate();
        toast.success('Semua pesanan berhasil dihapus');
      },
      onError: () => toast.error('Gagal menghapus pesanan'),
    });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CGV Snack Bar Dashboard</h1>
            <p className="text-muted-foreground">Kelola pesanan dan pengantaran ke bangku pelanggan</p>
            {user?.primaryEmailAddress?.emailAddress && (
              <p className="mt-1 text-xs text-muted-foreground">{user.primaryEmailAddress.emailAddress}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => signOut({ redirectUrl: '/' })}>
              Keluar
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Reset Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Semua Pesanan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Semua riwayat pesanan akan dihapus dari server.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">Hapus Semua</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Barcode Auditorium</h2>
              </div>
                <p className="text-sm text-muted-foreground mb-4">
                 Satu barcode ini dipasang di pintu auditorium dan berlaku untuk semua pengunjung.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={copyQrUrl}>
                  <Copy className="w-4 h-4 mr-2" /> Salin Link
                </Button>
                <Button onClick={downloadQr}>
                  <Download className="w-4 h-4 mr-2" /> Unduh QR
                </Button>
              </div>
              <p className="mt-3 break-all text-xs text-muted-foreground">{qrUrl}</p>
            </div>
            <div className="shrink-0 self-center rounded-xl border border-border bg-white p-3">
              <QRCodeSVG id="auditorium-qr-code" value={qrUrl} size={150} includeMargin aria-label="Barcode auditorium CGV Snack Bar" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Pesanan Baru (Hari Ini)</div>
            <div className="text-4xl font-bold text-primary">{summary?.newOrdersToday ?? 0}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Pendapatan (Hari Ini)</div>
            <div className="text-4xl font-bold text-foreground">{formatRupiah(summary?.revenueToday ?? 0)}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Pesanan Keseluruhan</div>
            <div className="text-4xl font-bold text-foreground">{summary?.totalOrders ?? 0}</div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex gap-2 overflow-x-auto">
            {(['semua', 'baru', 'disiapkan', 'selesai'] as const).map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                onClick={() => setStatusFilter(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID / Waktu</TableHead>
                  <TableHead>Lokasi & Pemesan</TableHead>
                  <TableHead>Items</TableHead>
                   <TableHead>Total / Pembayaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Memuat pesanan...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Belum ada pesanan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-mono font-medium text-primary">{order.orderCode}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{order.auditorium} · Kursi {order.seatNumber}</div>
                        <div className="text-xs text-muted-foreground">Atas nama {order.customerName}</div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <ul className="text-sm space-y-1">
                          {order.items.map((i, idx) => (
                            <li key={idx} className="line-clamp-1">
                              <span className="font-medium">{i.qty}x</span> {i.name}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                         <div className="font-semibold">{formatRupiah(order.total)}</div>
                         <div className="text-xs font-medium text-primary">{paymentLabel(order.paymentMethod)}</div>
                         {order.paymentMethod === 'CASH' && order.cashReceived !== null && order.cashReceived !== undefined && (
                           <div className="mt-1 text-xs text-muted-foreground">
                             Uang: {formatRupiah(order.cashReceived)}<br />
                             Kembalian: {formatRupiah(order.cashReceived - order.total)}
                           </div>
                         )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'baru' && (
                            <Button size="sm" disabled={updateStatus.isPending} onClick={() => handleStatusChange(order.id, 'disiapkan')}>
                              <ChefHat className="w-4 h-4 mr-1" /> Siapkan
                            </Button>
                          )}
                          {order.status === 'disiapkan' && (
                            <Button size="sm" variant="secondary" disabled={updateStatus.isPending} className="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleStatusChange(order.id, 'selesai')}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Selesai
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'baru':
      return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Baru</span>;
    case 'disiapkan':
      return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold flex items-center w-fit"><ChefHat className="w-3 h-3 mr-1" /> Disiapkan</span>;
    case 'selesai':
      return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Selesai</span>;
    default:
      return <span>{status}</span>;
  }
}

function paymentLabel(method: string) {
  if (method === 'CASH') return 'Cash';
  if (method === 'QRIS') return 'QRIS + EDC';
  if (method === 'DEBIT') return 'Debit + EDC';
  return method;
}
