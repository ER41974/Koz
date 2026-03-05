/* eslint-disable i18next/no-literal-string */
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { ToggleSwitch } from "../../ui/ToggleSwitch";
import { useSettings } from "../../../hooks/useSettings";
import { commands } from "@/bindings";
import type { KozMode, LLMPrompt } from "@/bindings";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";

// Inline editable mode row
const ModeRow: React.FC<{
  mode: KozMode;
  prompts: LLMPrompt[];
  wakePrefix: string;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}> = ({ mode, prompts, wakePrefix, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(mode.name);
  const [suffix, setSuffix] = useState(mode.wake_suffix);
  const [promptId, setPromptId] = useState<string | null>(mode.prompt_id);

  const save = useCallback(async () => {
    await commands.updateKozMode(mode.id, name, suffix, promptId, null);
    setEditing(false);
    onUpdate();
  }, [mode.id, name, suffix, promptId, onUpdate]);

  const toggleEnabled = useCallback(async () => {
    await commands.updateKozMode(mode.id, null, null, null, !mode.enabled);
    onUpdate();
  }, [mode.id, mode.enabled, onUpdate]);

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          className="bg-transparent border border-mid-gray/40 rounded px-2 py-1 text-sm w-32"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom"
        />
        <span className="text-xs text-mid-gray">{wakePrefix}</span>
        <input
          className="bg-transparent border border-mid-gray/40 rounded px-2 py-1 text-sm w-12 text-center"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          placeholder="#"
        />
        <select
          className="bg-transparent border border-mid-gray/40 rounded px-2 py-1 text-sm flex-1"
          value={promptId ?? ""}
          onChange={(e) => setPromptId(e.target.value || null)}
        >
          <option value="">(Pas de post-traitement)</option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={save}
          className="p-1 hover:bg-green-500/20 rounded"
          title="Sauvegarder"
        >
          <Check size={16} />
        </button>
        <button
          onClick={() => setEditing(false)}
          className="p-1 hover:bg-red-500/20 rounded"
          title="Annuler"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={mode.enabled}
          onChange={toggleEnabled}
          className="accent-logo-primary"
        />
        <span className="text-sm font-medium truncate">{mode.name}</span>
        <span className="text-xs text-mid-gray">
          "{wakePrefix} {mode.wake_suffix}"
        </span>
        <span className="text-xs text-mid-gray/60 truncate">
          {mode.prompt_id
            ? (prompts.find((p) => p.id === mode.prompt_id)?.name ??
              mode.prompt_id)
            : "(brut)"}
        </span>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="p-1 hover:bg-mid-gray/20 rounded"
        title="Modifier"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => onDelete(mode.id)}
        className="p-1 hover:bg-red-500/20 rounded"
        title="Supprimer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export const KozSettings: React.FC = () => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, isUpdating, settings } = useSettings();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSuffix, setNewSuffix] = useState("");
  const [newPromptId, setNewPromptId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const modes = getSetting("koz_modes") ?? [];
  const prompts = (getSetting("post_process_prompts") ?? []) as LLMPrompt[];
  const wakePrefix = getSetting("wake_word_prefix") ?? "Jarvis";
  const wakeEnabled = getSetting("wake_word_enabled") ?? true;
  const autoSwitch = getSetting("auto_switch_model") ?? false;
  const threshold = getSetting("auto_switch_threshold_secs") ?? 20;
  const initialPrompt = getSetting("whisper_initial_prompt") ?? "";

  const refresh = useCallback(async () => {
    const { refreshSettings } = await import(
      "../../../stores/settingsStore"
    ).then((m) => m.useSettingsStore.getState());
    await refreshSettings();
    setRefreshKey((k) => k + 1);
  }, []);

  const addMode = useCallback(async () => {
    const id = `mode_custom_${Date.now()}`;
    await commands.addKozMode(id, newName, newSuffix, newPromptId);
    setAdding(false);
    setNewName("");
    setNewSuffix("");
    setNewPromptId(null);
    refresh();
  }, [newName, newSuffix, newPromptId, refresh]);

  const deleteMode = useCallback(
    async (id: string) => {
      await commands.deleteKozMode(id);
      refresh();
    },
    [refresh],
  );

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6" key={refreshKey}>
      {/* Wake Words */}
      <SettingsGroup title="Wake Words">
        <ToggleSwitch
          checked={wakeEnabled}
          onChange={(v) => updateSetting("wake_word_enabled", v)}
          isUpdating={isUpdating("wake_word_enabled")}
          label="Activer les wake words"
          description="Dites le mot-cl\u00e9 suivi du num\u00e9ro de mode en fin de dict\u00e9e"
          descriptionMode="tooltip"
          grouped={true}
        />
        <div className="flex items-center gap-3 px-4 py-3">
          <label className="text-sm font-medium w-32">Pr\u00e9fixe</label>
          <input
            className="bg-transparent border border-mid-gray/40 rounded px-3 py-1.5 text-sm flex-1"
            value={wakePrefix}
            onChange={(e) => updateSetting("wake_word_prefix", e.target.value)}
            placeholder="Jarvis"
          />
        </div>
      </SettingsGroup>

      {/* Modes */}
      <SettingsGroup title="Modes Koz">
        {modes.map((mode: KozMode) => (
          <ModeRow
            key={mode.id}
            mode={mode}
            prompts={prompts}
            wakePrefix={wakePrefix}
            onUpdate={refresh}
            onDelete={deleteMode}
          />
        ))}
        {adding ? (
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="bg-transparent border border-mid-gray/40 rounded px-2 py-1 text-sm w-32"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du mode"
              autoFocus
            />
            <span className="text-xs text-mid-gray">{wakePrefix}</span>
            <input
              className="bg-transparent border border-mid-gray/40 rounded px-2 py-1 text-sm w-12 text-center"
              value={newSuffix}
              onChange={(e) => setNewSuffix(e.target.value)}
              placeholder="#"
            />
            <select
              className="bg-transparent border border-mid-gray/40 rounded px-2 py-1 text-sm flex-1"
              value={newPromptId ?? ""}
              onChange={(e) => setNewPromptId(e.target.value || null)}
            >
              <option value="">(Pas de post-traitement)</option>
              {prompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={addMode}
              disabled={!newName || !newSuffix}
              className="p-1 hover:bg-green-500/20 rounded disabled:opacity-40"
              title="Ajouter"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setAdding(false)}
              className="p-1 hover:bg-red-500/20 rounded"
              title="Annuler"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-mid-gray hover:text-foreground transition-colors w-full"
          >
            <Plus size={14} /> Ajouter un mode
          </button>
        )}
      </SettingsGroup>

      {/* Auto-switch */}
      <SettingsGroup title="Routage intelligent">
        <ToggleSwitch
          checked={autoSwitch}
          onChange={(v) => updateSetting("auto_switch_model", v)}
          isUpdating={isUpdating("auto_switch_model")}
          label="Routage automatique du mod\u00e8le"
          description={`< ${threshold}s → mod\u00e8le l\u00e9ger, \u2265 ${threshold}s → mod\u00e8le lourd`}
          descriptionMode="inline"
          grouped={true}
        />
        {autoSwitch && (
          <>
            <div className="flex items-center gap-3 px-4 py-3">
              <label className="text-sm font-medium w-32">Seuil (sec)</label>
              <input
                type="number"
                className="bg-transparent border border-mid-gray/40 rounded px-3 py-1.5 text-sm w-20"
                value={threshold}
                min={5}
                max={120}
                onChange={(e) =>
                  updateSetting(
                    "auto_switch_threshold_secs",
                    parseInt(e.target.value) || 20,
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <label className="text-sm font-medium w-32">
                Mod\u00e8le l\u00e9ger
              </label>
              <input
                className="bg-transparent border border-mid-gray/40 rounded px-3 py-1.5 text-sm flex-1"
                value={getSetting("light_model_id") ?? ""}
                onChange={(e) =>
                  updateSetting("light_model_id", e.target.value || null)
                }
                placeholder="(auto-d\u00e9tection)"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <label className="text-sm font-medium w-32">
                Mod\u00e8le lourd
              </label>
              <input
                className="bg-transparent border border-mid-gray/40 rounded px-3 py-1.5 text-sm flex-1"
                value={getSetting("heavy_model_id") ?? ""}
                onChange={(e) =>
                  updateSetting("heavy_model_id", e.target.value || null)
                }
                placeholder="(auto-d\u00e9tection)"
              />
            </div>
          </>
        )}
      </SettingsGroup>

      {/* Whisper initial prompt */}
      <SettingsGroup title="Optimisation Whisper">
        <div className="px-4 py-3 space-y-2">
          <label className="text-sm font-medium">
            Initial prompt (aide \u00e0 la langue)
          </label>
          <p className="text-xs text-mid-gray">
            Aide Whisper \u00e0 reconna\u00eetre les langues utilis\u00e9es.
            Incluez des mots dans vos langues principales.
          </p>
          <textarea
            className="bg-transparent border border-mid-gray/40 rounded px-3 py-2 text-sm w-full resize-none"
            rows={2}
            value={initialPrompt}
            onChange={(e) =>
              updateSetting("whisper_initial_prompt", e.target.value)
            }
            placeholder="Bonjour, voici une phrase en fran\u00e7ais et parfois in english."
          />
        </div>
      </SettingsGroup>
    </div>
  );
};
