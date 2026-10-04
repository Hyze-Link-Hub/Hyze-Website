"use client";

import { hoverLift, listItem, listStagger, tapPress } from "@/lib/motion";
import { useProfileStore, type ProfileChannel } from "@/lib/store/useProfileStore";
import { motion } from "framer-motion";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";

const fieldClass =
  "field-input";

const iconButtonClass =
  "icon-btn";

type ChannelDraft = {
  platform: string;
  handle: string;
  followers_text: string;
  url: string;
};

const emptyDraft: ChannelDraft = {
  platform: "",
  handle: "",
  followers_text: "",
  url: "",
};

export default function ChannelsManager() {
  const channels = useProfileStore((state) => state.channels);
  const addChannel = useProfileStore((state) => state.addChannel);
  const updateChannel = useProfileStore((state) => state.updateChannel);
  const removeChannel = useProfileStore((state) => state.removeChannel);
  const [form, setForm] = useState<ChannelDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChannelDraft>(emptyDraft);

  const canAdd =
    form.platform.trim().length > 0 &&
    form.handle.trim().length > 0 &&
    form.url.trim().length > 0;

  function submitAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const platform = form.platform.trim();
    const handle = form.handle.trim();
    const url = form.url.trim();
    if (!platform || !handle || !url) return;

    addChannel({
      platform,
      handle,
      url,
      followers_text: form.followers_text.trim() || null,
    });
    setForm(emptyDraft);
  }

  function startEdit(channel: ProfileChannel) {
    setEditingId(channel.id);
    setDraft({
      platform: channel.platform,
      handle: channel.handle,
      followers_text: channel.followers_text ?? "",
      url: channel.url,
    });
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const platform = draft.platform.trim();
    const handle = draft.handle.trim();
    const url = draft.url.trim();
    if (!editingId || !platform || !handle || !url) return;

    updateChannel(editingId, {
      platform,
      handle,
      url,
      followers_text: draft.followers_text.trim() || null,
    });
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-frost rounded-[28px] p-4 sm:p-5">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
          Add Channel
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Platform cards shown in your mini-site hub.
        </p>

        <form onSubmit={submitAdd} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">
              Platform
            </span>
            <input
              value={form.platform}
              onChange={(event) => setForm((c) => ({ ...c, platform: event.target.value }))}
              placeholder="YouTube"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="field-label">
              Handle
            </span>
            <input
              value={form.handle}
              onChange={(event) => setForm((c) => ({ ...c, handle: event.target.value }))}
              placeholder="@nocturne"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="field-label">
              Followers text
            </span>
            <input
              value={form.followers_text}
              onChange={(event) =>
                setForm((c) => ({ ...c, followers_text: event.target.value }))
              }
              placeholder="312K"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="field-label">
              URL
            </span>
            <input
              value={form.url}
              onChange={(event) => setForm((c) => ({ ...c, url: event.target.value }))}
              placeholder="youtube.com/@nocturne"
              inputMode="url"
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
              Add Channel
            </motion.button>
          </div>
        </form>
      </section>

      <section aria-label="Current channels" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight text-white">
            Your channels
          </h2>
          <p className="label-mono text-accent-ice/60">{channels.length} on your hub</p>
        </div>

        {channels.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-subtle bg-surface-raised/40 px-4 py-10 text-center text-sm text-white/45">
            No channels yet. Add one above for The Hub.
          </div>
        ) : (
          <motion.ul className="flex flex-col gap-2.5" variants={listStagger} initial="hidden" animate="visible">
            {channels.map((channel) => {
              const editing = editingId === channel.id;
              return (
                <motion.li
                  key={channel.id}
                  variants={listItem}
                  whileHover={editing ? undefined : hoverLift}
                  className="list-tile px-3 py-2.5 hover:border-strong"
                >
                  {editing ? (
                    <form onSubmit={saveEdit} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        value={draft.platform}
                        onChange={(e) => setDraft((c) => ({ ...c, platform: e.target.value }))}
                        aria-label="Platform"
                        className={fieldClass}
                      />
                      <input
                        value={draft.handle}
                        onChange={(e) => setDraft((c) => ({ ...c, handle: e.target.value }))}
                        aria-label="Handle"
                        className={fieldClass}
                      />
                      <input
                        value={draft.followers_text}
                        onChange={(e) =>
                          setDraft((c) => ({ ...c, followers_text: e.target.value }))
                        }
                        aria-label="Followers"
                        className={fieldClass}
                      />
                      <input
                        value={draft.url}
                        onChange={(e) => setDraft((c) => ({ ...c, url: e.target.value }))}
                        aria-label="URL"
                        className={fieldClass}
                      />
                      <div className="flex justify-end gap-1 sm:col-span-2">
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
                        <p className="truncate text-sm font-medium tracking-tight text-white">
                          {channel.platform}
                          <span className="ml-2 text-xs font-normal text-white/40">
                            {channel.handle}
                          </span>
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {channel.followers_text
                            ? `${channel.followers_text} followers`
                            : channel.url}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`${iconButtonClass} hover:border-accent-cyan/40 hover:text-accent-ice`}
                        aria-label={`Edit ${channel.platform}`}
                        onClick={() => startEdit(channel)}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        className={`${iconButtonClass} hover:border-rose-300/30 hover:text-rose-300`}
                        aria-label={`Delete ${channel.platform}`}
                        onClick={() => removeChannel(channel.id)}
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
