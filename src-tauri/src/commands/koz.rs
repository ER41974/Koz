use crate::settings::{get_settings, write_settings, KozMode};
use tauri::AppHandle;

#[tauri::command]
#[specta::specta]
pub fn get_koz_modes(app: AppHandle) -> Result<Vec<KozMode>, String> {
    let settings = get_settings(&app);
    Ok(settings.koz_modes)
}

#[tauri::command]
#[specta::specta]
pub fn add_koz_mode(
    app: AppHandle,
    id: String,
    name: String,
    wake_suffix: String,
    prompt_id: Option<String>,
) -> Result<(), String> {
    let mut settings = get_settings(&app);

    // Ensure unique id
    if settings.koz_modes.iter().any(|m| m.id == id) {
        return Err(format!("A mode with id '{}' already exists", id));
    }

    settings.koz_modes.push(KozMode {
        id,
        name,
        wake_suffix,
        prompt_id,
        enabled: true,
    });

    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn update_koz_mode(
    app: AppHandle,
    id: String,
    name: Option<String>,
    wake_suffix: Option<String>,
    prompt_id: Option<Option<String>>,
    enabled: Option<bool>,
) -> Result<(), String> {
    let mut settings = get_settings(&app);

    let mode = settings
        .koz_modes
        .iter_mut()
        .find(|m| m.id == id)
        .ok_or_else(|| format!("Mode '{}' not found", id))?;

    if let Some(n) = name {
        mode.name = n;
    }
    if let Some(ws) = wake_suffix {
        mode.wake_suffix = ws;
    }
    if let Some(pid) = prompt_id {
        mode.prompt_id = pid;
    }
    if let Some(e) = enabled {
        mode.enabled = e;
    }

    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn delete_koz_mode(app: AppHandle, id: String) -> Result<(), String> {
    let mut settings = get_settings(&app);
    let len_before = settings.koz_modes.len();
    settings.koz_modes.retain(|m| m.id != id);

    if settings.koz_modes.len() == len_before {
        return Err(format!("Mode '{}' not found", id));
    }

    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn get_wake_word_prefix(app: AppHandle) -> Result<String, String> {
    let settings = get_settings(&app);
    Ok(settings.wake_word_prefix)
}

#[tauri::command]
#[specta::specta]
pub fn set_wake_word_prefix(app: AppHandle, prefix: String) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.wake_word_prefix = prefix;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn get_wake_word_enabled(app: AppHandle) -> Result<bool, String> {
    let settings = get_settings(&app);
    Ok(settings.wake_word_enabled)
}

#[tauri::command]
#[specta::specta]
pub fn set_wake_word_enabled(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.wake_word_enabled = enabled;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn set_auto_switch_model(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.auto_switch_model = enabled;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn set_light_model(app: AppHandle, model_id: Option<String>) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.light_model_id = model_id;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn set_heavy_model(app: AppHandle, model_id: Option<String>) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.heavy_model_id = model_id;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn set_auto_switch_threshold(app: AppHandle, threshold_secs: u32) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.auto_switch_threshold_secs = threshold_secs;
    write_settings(&app, settings);
    Ok(())
}

#[tauri::command]
#[specta::specta]
pub fn get_whisper_initial_prompt(app: AppHandle) -> Result<String, String> {
    let settings = get_settings(&app);
    Ok(settings.whisper_initial_prompt)
}

#[tauri::command]
#[specta::specta]
pub fn set_whisper_initial_prompt(app: AppHandle, prompt: String) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.whisper_initial_prompt = prompt;
    write_settings(&app, settings);
    Ok(())
}
