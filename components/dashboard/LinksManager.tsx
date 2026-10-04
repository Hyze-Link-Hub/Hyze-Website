"use client";

import { useProfileStore, type ProfileLink } from "@/lib/store/useProfileStore";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { hoverLift, listItem, listStagger, tapPress } from "@/lib/motion";
import { motion } from "framer-motion";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

const fieldClass =
  "field-input";

const iconButtonClass =
  "icon-btn";

const tileClass = (dragging: boolean) =>
  `group flex items-center gap-2 rounded-[22px] border bg-surface-raised/60 px-2.5 py-2.5 backdrop-blur-2xl transition-[border-color,box-shadow] duration-300 sm:gap-3 sm:px-3 ${
    dragging
      ? "relative z-10 scale-[1.02] border-accent-cyan/40 bg-surface-overlay/80 shadow-[0_24px_44px_-18px_rgba(0,0,0,0.95),0_0_36px_-12px_rgba(54,214,255,0.55),inset_0_1px_0_rgba(255,255,255,0.1)]"
      : "border-subtle shadow-[0_10px_30px_-14px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-strong hover:shadow-[0_20px_44px_-18px_rgba(0,0,0,0.9),0_0_36px_-14px_rgba(54,214,255,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
  }`;

type LinkDraft = { title: string; url: string; subtitle: string; is_social: boolean };

function SortableLinkCard({
  id,
  link,
  editing,
  draft,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  id: string;
  link: ProfileLink;
  editing: boolean;
  draft: LinkDraft;
  onDraftChange: (draft: LinkDraft) => void;
  onStartEdit: (link: ProfileLink) => void;
  onCancelEdit: () => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: editing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <motion.div
        className={tileClass(isDragging)}
        variants={listItem}
        whileHover={isDragging || editing ? undefined : hoverLift}
      >
        <button
          type="button"
          className="flex h-9 w-8 shrink-0 cursor-grab items-center justify-center rounded-full text-white/25 outline-none transition hover:text-accent-ice focus-visible:ring-2 focus-visible:ring-accent-ice/60 active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
          aria-label={`Reorder ${link.title}`}
          disabled={editing}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {editing ? (
          <form onSubmit={onSaveEdit} className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={draft.title}
                onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
                aria-label="Link title"
                className={fieldClass}
              />
              <input
                value={draft.url}
                onChange={(event) => onDraftChange({ ...draft, url: event.target.value })}
                aria-label="Link URL"
                inputMode="url"
                className={fieldClass}
              />
              <div className="flex shrink-0 justify-end gap-1">
                <button
                  type="submit"
                  className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}
                  aria-label={`Save ${link.title}`}
                >
                  <Check className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}
                  aria-label="Cancel editing"
                  onClick={onCancelEdit}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
            {draft.is_social ? null : (
              <label className="block">
                <span className="field-label">
                  Subtitle / Description
                </span>
                <input
                  value={draft.subtitle}
                  onChange={(event) => onDraftChange({ ...draft, subtitle: event.target.value })}
                  placeholder="Optional line under the title"
                  aria-label="Link subtitle"
                  autoComplete="off"
                  className={fieldClass}
                />
              </label>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2.5 px-1 text-sm text-white/65">
              <input
                type="checkbox"
                checked={draft.is_social}
                onChange={(event) => onDraftChange({ ...draft, is_social: event.target.checked })}
                className="h-4 w-4 rounded border-subtle bg-surface-base accent-[var(--accent-cyan)] focus:ring-accent-ice/50"
              />
              Display as Icon
            </label>
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium tracking-tight text-white">
                {link.title}
                {link.is_social ? (
                  <span className="label-mono ml-2 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-1.5 py-0.5 text-accent-ice/80">
                    Icon
                  </span>
                ) : null}
              </p>
              {!link.is_social && link.subtitle ? (
                <p className="truncate text-xs text-white/45">{link.subtitle}</p>
              ) : null}
              <p className="truncate font-mono text-xs text-white/40">{link.url}</p>
            </div>
            <button
              type="button"
              className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}
              aria-label={`Edit ${link.title}`}
              onClick={() => onStartEdit(link)}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={`${iconButtonClass} hover:border-rose-300/30 hover:text-rose-300`}
              aria-label={`Delete ${link.title}`}
              onClick={() => onDelete(link.id)}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </>
        )}
      </motion.div>
    </li>
  );
}

export default function LinksManager() {
  const links = useProfileStore((state) => state.links);
  const addStoreLink = useProfileStore((state) => state.addLink);
  const updateLink = useProfileStore((state) => state.updateLink);
  const removeLink = useProfileStore((state) => state.removeLink);
  const reorderLinks = useProfileStore((state) => state.reorderLinks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isSocial, setIsSocial] = useState(false);
  const reorderRequest = useRef(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LinkDraft>({
    title: "",
    url: "",
    subtitle: "",
    is_social: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const canAdd = title.trim().length > 0 && url.trim().length > 0;

  function addLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    const nextUrl = url.trim();
    if (!nextTitle || !nextUrl) return;

    addStoreLink({
      title: nextTitle,
      url: nextUrl,
      is_social: isSocial,
      subtitle: isSocial ? null : subtitle.trim() || null,
    });
    setTitle("");
    setUrl("");
    setSubtitle("");
    setIsSocial(false);
  }

  function startEdit(link: ProfileLink) {
    setEditingId(link.id);
    setDraft({
      title: link.title,
      url: link.url,
      subtitle: link.subtitle ?? "",
      is_social: link.is_social,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = draft.title.trim();
    const nextUrl = draft.url.trim();
    if (!editingId || !nextTitle || !nextUrl) return;

    updateLink(editingId, {
      title: nextTitle,
      url: nextUrl,
      is_social: draft.is_social,
      subtitle: draft.is_social ? null : draft.subtitle.trim() || null,
    });
    setEditingId(null);
  }

  function restoreLinkOrder(previousIds: string[]) {
    const rank = new Map(previousIds.map((id, index) => [id, index]));
    const current = useProfileStore.getState().links;
    const restored = [...current].sort(
      (a, b) =>
        (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
    reorderLinks(restored);
  }

  function deleteLink(id: string) {
    removeLink(id);
    if (editingId === id) setEditingId(null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((link) => link.id === active.id);
    const newIndex = links.findIndex((link) => link.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousIds = links.map((link) => link.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    const requestId = ++reorderRequest.current;
    reorderLinks(reordered);

    const payload = reordered.map((link, index) => ({ id: link.id, order_index: index }));
    void fetch("/api/links/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (requestId !== reorderRequest.current || response.ok) return;
        restoreLinkOrder(previousIds);
      })
      .catch(() => {
        if (requestId !== reorderRequest.current) return;
        restoreLinkOrder(previousIds);
      });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-frost rounded-[28px] p-4 sm:p-5">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Add New Link
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Title and destination shown on your public page.
        </p>

        <form onSubmit={addLink} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="field-label">
                Title
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Twitch Stream"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="field-label">
                URL
              </span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="twitch.tv/vexlsgg"
                inputMode="url"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <motion.button
              type="submit"
              disabled={!canAdd}
              whileHover={canAdd ? hoverLift : undefined}
              whileTap={canAdd ? tapPress : undefined}
              className="btn-primary"
            >
              Add Link
            </motion.button>
          </div>

          {isSocial ? null : (
            <label className="block">
              <span className="field-label">
                Subtitle / Description
              </span>
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Optional line under the title"
                autoComplete="off"
                className={fieldClass}
              />
            </label>
          )}

          <label className="inline-flex cursor-pointer items-center gap-2.5 px-1 text-sm text-white/65">
            <input
              type="checkbox"
              checked={isSocial}
              onChange={(event) => setIsSocial(event.target.checked)}
              className="h-4 w-4 rounded border-subtle bg-surface-base accent-[var(--accent-cyan)] focus:ring-accent-ice/50"
            />
            Display as Icon
          </label>
        </form>
      </section>

      <section aria-label="Current links" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
            Your links
          </h2>
          <p className="label-mono text-accent-ice/60">{links.length} on your page</p>
        </div>

        {links.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-subtle bg-surface-raised/40 px-4 py-10 text-center text-sm text-white/45">
            No links yet. Add one above and it will show up here.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
              <motion.ul className="flex flex-col gap-2.5" variants={listStagger} initial="hidden" animate="visible">
                {links.map((link) => (
                  <SortableLinkCard
                    key={link.id}
                    id={link.id}
                    link={link}
                    editing={editingId === link.id}
                    draft={draft}
                    onDraftChange={setDraft}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onDelete={deleteLink}
                  />
                ))}
              </motion.ul>
            </SortableContext>
          </DndContext>
        )}
      </section>
    </div>
  );
}
