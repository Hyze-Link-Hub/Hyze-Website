"use client";

import { hoverLift, listItem, listStagger, tapPress } from "@/lib/motion";
import { useProfileStore, type ProfileVideo } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";

const fieldClass =
  "field-input";

const iconButtonClass =
  "icon-btn";

type VideoDraft = {
  title: string;
  url: string;
  thumbnail_url: string;
  duration: string;
  views_text: string;
};

const emptyDraft: VideoDraft = {
  title: "",
  url: "",
  thumbnail_url: "",
  duration: "",
  views_text: "",
};

export default function VideosManager() {
  const videos = useProfileStore((state) => state.videos);
  const addVideo = useProfileStore((state) => state.addVideo);
  const updateVideo = useProfileStore((state) => state.updateVideo);
  const removeVideo = useProfileStore((state) => state.removeVideo);
  const [form, setForm] = useState<VideoDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VideoDraft>(emptyDraft);

  const canAdd = form.title.trim().length > 0 && form.url.trim().length > 0;

  function submitAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const url = form.url.trim();
    if (!title || !url) return;

    addVideo({
      title,
      url,
      thumbnail_url: form.thumbnail_url.trim() || null,
      duration: form.duration.trim() || null,
      views_text: form.views_text.trim() || null,
    });
    setForm(emptyDraft);
  }

  function startEdit(video: ProfileVideo) {
    setEditingId(video.id);
    setDraft({
      title: video.title,
      url: video.url,
      thumbnail_url: video.thumbnail_url ?? "",
      duration: video.duration ?? "",
      views_text: video.views_text ?? "",
    });
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    const url = draft.url.trim();
    if (!editingId || !title || !url) return;

    updateVideo(editingId, {
      title,
      url,
      thumbnail_url: draft.thumbnail_url.trim() || null,
      duration: draft.duration.trim() || null,
      views_text: draft.views_text.trim() || null,
    });
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-frost rounded-[28px] p-4 sm:p-5">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Add Video
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Recent uploads shown in your mini-site hub.
        </p>

        <form onSubmit={submitAdd} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="field-label">
              Title
            </span>
            <input
              value={form.title}
              onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))}
              placeholder="Ranked clutch — overtime 1v3"
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">
              URL
            </span>
            <input
              value={form.url}
              onChange={(event) => setForm((c) => ({ ...c, url: event.target.value }))}
              placeholder="youtube.com/watch?v=..."
              inputMode="url"
              className={fieldClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="field-label">
              Thumbnail URL
            </span>
            <input
              value={form.thumbnail_url}
              onChange={(event) =>
                setForm((c) => ({ ...c, thumbnail_url: event.target.value }))
              }
              placeholder="https://..."
              inputMode="url"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="field-label">
              Duration
            </span>
            <input
              value={form.duration}
              onChange={(event) => setForm((c) => ({ ...c, duration: event.target.value }))}
              placeholder="12:48"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="field-label">
              Views text
            </span>
            <input
              value={form.views_text}
              onChange={(event) => setForm((c) => ({ ...c, views_text: event.target.value }))}
              placeholder="84K"
              className={fieldClass}
            />
          </label>
          <div className="sm:col-span-2">
            <motion.button
              type="submit"
              disabled={!canAdd}
              whileHover={canAdd ? hoverLift : undefined}
              whileTap={canAdd ? tapPress : undefined}
              className="btn-primary"
            >
              Add Video
            </motion.button>
          </div>
        </form>
      </section>

      <section aria-label="Current videos" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
            Your videos
          </h2>
          <p className="label-mono text-accent-ice/60">{videos.length} on your hub</p>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-subtle bg-surface-raised/40 px-4 py-10 text-center text-sm text-white/45">
            No videos yet. Add one above for The Hub.
          </div>
        ) : (
          <motion.ul className="flex flex-col gap-2.5" variants={listStagger} initial="hidden" animate="visible">
            {videos.map((video) => {
              const editing = editingId === video.id;
              return (
                <motion.li
                  key={video.id}
                  variants={listItem}
                  whileHover={editing ? undefined : hoverLift}
                  className="list-tile px-3 py-2.5 hover:border-strong"
                >
                  {editing ? (
                    <form onSubmit={saveEdit} className="flex flex-col gap-2">
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                        aria-label="Video title"
                        className={fieldClass}
                      />
                      <input
                        value={draft.url}
                        onChange={(e) => setDraft((c) => ({ ...c, url: e.target.value }))}
                        aria-label="Video URL"
                        className={fieldClass}
                      />
                      <input
                        value={draft.thumbnail_url}
                        onChange={(e) =>
                          setDraft((c) => ({ ...c, thumbnail_url: e.target.value }))
                        }
                        aria-label="Thumbnail URL"
                        className={fieldClass}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={draft.duration}
                          onChange={(e) =>
                            setDraft((c) => ({ ...c, duration: e.target.value }))
                          }
                          aria-label="Duration"
                          placeholder="Duration"
                          className={fieldClass}
                        />
                        <input
                          value={draft.views_text}
                          onChange={(e) =>
                            setDraft((c) => ({ ...c, views_text: e.target.value }))
                          }
                          aria-label="Views text"
                          placeholder="Views"
                          className={fieldClass}
                        />
                      </div>
                      <div className="flex justify-end gap-1">
                        <button type="submit" className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}>
                          <Check className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium tracking-tight text-white">{video.title}</p>
                        <p className="truncate text-xs text-white/40">
                          {[video.duration, video.views_text ? `${video.views_text} views` : null]
                            .filter(Boolean)
                            .join(" · ") || video.url}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}
                        aria-label={`Edit ${video.title}`}
                        onClick={() => startEdit(video)}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        className={`${iconButtonClass} hover:border-rose-300/30 hover:text-rose-300`}
                        aria-label={`Delete ${video.title}`}
                        onClick={() => removeVideo(video.id)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </section>
    </div>
  );
}
