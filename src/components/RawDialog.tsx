import { Dialog } from './Dialog';

/** Pretty-printed JSON of the full API response or one agent's record. */
export function RawDialog({ title, data, onClose }: { title: string; data: unknown; onClose: () => void }) {
  return (
    <Dialog label={title} onClose={onClose}>
      <h2 className="dialog-title">{title}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          close
        </button>
      </div>
    </Dialog>
  );
}
