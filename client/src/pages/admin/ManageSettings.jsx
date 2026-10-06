import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader, { primaryBtn } from '../../components/admin/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { getSettings, updateSettings } from '../../services/adminService';

export default function ManageSettings() {
  const { data, loading, error } = useFetch(getSettings);
  const [cod, setCod] = useState(true);
  const [saved, setSaved] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) { setCod(data.codEnabled); setSaved(data.codEnabled); } }, [data]);

  const save = async () => {
    setBusy(true);
    try { const s = await updateSettings({ codEnabled: cod }); setSaved(s.codEnabled); toast.success('Settings saved'); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  if (error) return <p role="alert" className="text-maroon-700">{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <PageHeader title="Settings" />
      <section className="max-w-xl rounded-lg border border-gold-300 bg-white p-5">
        <h2 className="text-xl font-semibold">Payment options</h2>
        <label className="mt-4 flex items-start gap-3">
          <input type="checkbox" checked={cod} onChange={(e) => setCod(e.target.checked)} className="mt-1 h-5 w-5 accent-maroon-700" />
          <span><span className="font-medium">Accept cash on delivery</span><span className="block text-sm text-ink/70">When off, customers can only pay online (if online payment is set up).</span></span>
        </label>
        <button onClick={save} disabled={busy || cod === saved} className={`${primaryBtn} mt-5`}>{busy ? 'Saving...' : 'Save settings'}</button>
      </section>
    </>
  );
}
