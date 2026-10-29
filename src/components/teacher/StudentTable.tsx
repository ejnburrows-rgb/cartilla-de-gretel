import { User, Trash2, Award, Pencil, ArchiveRestore, Archive } from "lucide-react";

export interface RosterStudent {
  id: string;
  display_name: string;
  student_code: string;
  lessons: number;
  lastSeen: string | null;
  archived_at?: string | null;
}

interface StudentTableProps {
  studentsList: RosterStudent[];
  searchQuery: string;
  editingId: string | null;
  editingName: string;
  busy: boolean;
  isSeed: boolean;
  setEditingName: (name: string) => void;
  setEditingId: (id: string | null) => void;
  handleSaveRename: (id: string) => void;
  startEditing: (student: RosterStudent) => void;
  handleArchiveToggle: (student: RosterStudent) => void;
  handleDeleteStudent: (id: string, name: string) => void;
}

export function StudentTable({
  studentsList,
  searchQuery,
  editingId,
  editingName,
  busy,
  isSeed,
  setEditingName,
  setEditingId,
  handleSaveRename,
  startEditing,
  handleArchiveToggle,
  handleDeleteStudent,
}: StudentTableProps) {
  if (studentsList.length === 0) {
    return (
      <div role="status" className="p-8 text-center text-sm font-bold text-stone-400">
        Ningún alumno coincide con &quot;{searchQuery}&quot;.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50/70 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
          <tr>
            <th className="p-4 pl-6">Alumno</th>
            <th className="p-4">Código Personal</th>
            <th className="p-4">Lecciones Completas</th>
            <th className="p-4">Última Actividad</th>
            <th className="p-4 pr-6 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white">
          {studentsList.map((s) => (
            <tr
              key={s.id}
              className={`hover:bg-stone-50/50 transition-colors group ${
                s.archived_at ? "opacity-50" : ""
              }`}
            >
              <td className="p-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(28,87%,88%)] to-[hsl(48,95%,85%)] flex items-center justify-center text-orange-800 shadow-inner shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  {editingId === s.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveRename(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(s.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus readOnly={busy} aria-label="Nombre del alumno"
                      maxLength={50}
                      className="font-extrabold text-stone-800 text-sm px-2 py-1 rounded-lg border-2 border-vowel-a focus:outline-none w-40"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditing(s)}
                      disabled={busy}
                      className="font-extrabold text-stone-800 text-sm text-left hover:underline decoration-dotted underline-offset-2 disabled:no-underline disabled:cursor-default cursor-pointer"
                      title="Editar nombre"
                    >
                      {s.display_name}
                      {s.archived_at && (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-stone-400 align-middle">
                          Archivado
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/50">
                  {s.student_code}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600">
                  <Award className="w-4 h-4 text-emerald-500" /> {s.lessons} lecciones
                </div>
              </td>
              <td className="p-4 text-stone-600 font-semibold text-xs">
                {s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : "Ninguna registrada"}
              </td>
              <td className="p-4 pr-6 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => startEditing(s)}
                    disabled={busy}
                    className="p-2 text-stone-400 hover:text-vowel-a hover:bg-[hsl(48,100%,97%)] rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                    title="Renombrar Alumno"
                    aria-label="Renombrar Alumno"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchiveToggle(s)}
                    disabled={busy || isSeed}
                    className="p-2 text-stone-400 hover:text-vowel-o hover:bg-[hsl(198,78%,97%)] rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                    title={s.archived_at ? "Restaurar Alumno" : "Archivar Alumno"}
                    aria-label={s.archived_at ? "Restaurar Alumno" : "Archivar Alumno"}
                  >
                    {s.archived_at ? (
                      <ArchiveRestore className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(s.id, s.display_name)}
                    disabled={busy}
                    className="p-2 text-stone-400 hover:text-[hsl(354,78%,56%)] hover:bg-[hsl(354,78%,98%)] rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                    title="Eliminar Alumno"
                    aria-label="Eliminar Alumno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
