import { Pencil, Trash2 } from "lucide-react";

export function EntryActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <div className="ml-2 flex items-center gap-1">
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          aria-label="Edytuj"
          className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Usuń"
        className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-muted-foreground hover:bg-red-500/30 hover:text-red-300"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}