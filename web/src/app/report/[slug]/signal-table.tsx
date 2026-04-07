export function SignalTable({
  signalMap,
}: {
  signalMap: Record<
    string,
    { control: boolean; treatment: boolean; proves: string }
  >;
}) {
  const entries = Object.entries(signalMap);
  const activeEntries = entries.filter(
    ([, v]) => v.control || v.treatment
  );

  if (activeEntries.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 p-5">
        <h2 className="text-lg font-medium">Verification Signals</h2>
        <p className="mt-2 text-sm text-zinc-500">
          No signals detected in output files.
        </p>
      </div>
    );
  }

  const grouped = new Map<string, { signal: string; control: boolean; treatment: boolean }[]>();
  for (const [signal, val] of entries) {
    if (!val.control && !val.treatment) continue;
    const group = val.proves;
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push({ signal, ...val });
  }

  return (
    <div className="rounded-lg border border-zinc-800 p-5 space-y-4">
      <h2 className="text-lg font-medium">Verification Signals</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="pb-2 pr-4">Signal</th>
              <th className="pb-2 pr-4">Control</th>
              <th className="pb-2 pr-4">Treatment</th>
              <th className="pb-2">Proves</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {[...grouped.entries()].map(([group, signals]) =>
              signals.map((s, i) => (
                <tr
                  key={s.signal}
                  className="border-b border-zinc-800/50"
                >
                  <td className="py-1.5 pr-4 text-zinc-300">
                    {s.signal}
                  </td>
                  <td className="py-1.5 pr-4">
                    <Dot active={s.control} />
                  </td>
                  <td className="py-1.5 pr-4">
                    <Dot active={s.treatment} />
                  </td>
                  <td className="py-1.5 font-sans text-zinc-500">
                    {i === 0 ? group : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Dot({ active }: { active: boolean }) {
  return active ? (
    <span className="text-emerald-400">&#x25CF;</span>
  ) : (
    <span className="text-zinc-700">&#x25CB;</span>
  );
}
