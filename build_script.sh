#!/usr/bin/env bash

set -e

echo "=== Koz App Automation Script ==="
echo "Starting local deployment preparation..."

# 1. Check required tools
if ! command -v rustc >/dev/null 2>&1; then
    echo >&2 "Rust is required but it's not installed. Aborting."
    exit 1
fi
if ! command -v bun >/dev/null 2>&1; then
    echo >&2 "Bun is required but it's not installed. Aborting."
    exit 1
fi

# 2. Linux Dependencies (Only if on Linux)
if [ "$(uname)" == "Linux" ]; then
    echo "Detected Linux OS. Installing necessary dependencies..."
    if command -v apt-get >/dev/null; then
        sudo apt-get update
        sudo apt-get install -y \
            build-essential \
            libasound2-dev \
            pkg-config \
            libssl-dev \
            libvulkan-dev \
            vulkan-tools \
            glslc \
            libgtk-3-dev \
            libwebkit2gtk-4.1-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            libgtk-layer-shell0 \
            libgtk-layer-shell-dev \
            patchelf \
            cmake
    elif command -v dnf >/dev/null; then
        sudo dnf groupinstall -y "Development Tools"
        sudo dnf install -y \
            alsa-lib-devel \
            pkgconf \
            openssl-devel \
            vulkan-devel \
            gtk3-devel \
            webkit2gtk4.1-devel \
            libappindicator-gtk3-devel \
            librsvg2-devel \
            gtk-layer-shell \
            gtk-layer-shell-devel \
            cmake
    elif command -v pacman >/dev/null; then
        sudo pacman -Sy --noconfirm --needed \
            base-devel \
            alsa-lib \
            pkgconf \
            openssl \
            vulkan-devel \
            gtk3 \
            webkit2gtk-4.1 \
            libappindicator-gtk3 \
            librsvg \
            gtk-layer-shell \
            cmake
    else
        echo "Unsupported Linux package manager. Please install dependencies manually."
    fi
fi

# 3. macOS Dependencies (Only if on macOS)
if [ "$(uname)" == "Darwin" ]; then
    echo "Detected macOS."
    if ! xcode-select -p >/dev/null 2>&1; then
        echo "Installing Xcode Command Line Tools..."
        xcode-select --install
    else
        echo "Xcode Command Line Tools already installed."
    fi
fi

# 4. Install project dependencies
echo "Installing project dependencies via Bun..."
bun install

# 5. Build Tauri App
echo "Building Tauri Application..."
bun tauri build

echo "=== Build Complete! ==="
echo "You can find the generated installers in src-tauri/target/release/bundle/"
