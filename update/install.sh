#!/usr/bin/env bash
# Устанавливает геймификацию (XP/уровни/анимации) в проект FocusFriends
# и поднимает фронтенд через Docker.
#
# Использование:
#   ./install.sh /путь/к/твоему/проекту/focusfriends
#
# Если путь не указать — скрипт попробует использовать текущую директорию.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$(pwd)}"

if [ ! -d "$TARGET/frontend" ] || [ ! -f "$TARGET/docker-compose.yml" ]; then
  echo "Не похоже на корень проекта FocusFriends: $TARGET"
  echo "Укажи путь явно: ./install.sh /путь/к/focusfriends"
  exit 1
fi

echo "==> Копирую файлы в $TARGET"
cp -v "$SCRIPT_DIR/files/frontend/src/context/GamificationContext.tsx" "$TARGET/frontend/src/context/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/XpBar.tsx"          "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/XpToast.tsx"        "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/LevelUpDialog.tsx"  "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/Layout.tsx"         "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/TaskSection.tsx"    "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/HabitCard.tsx"      "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/index.css"                     "$TARGET/frontend/src/"
cp -v "$SCRIPT_DIR/files/frontend/src/main.tsx"                      "$TARGET/frontend/src/"
cp -v "$SCRIPT_DIR/files/frontend/Dockerfile"                        "$TARGET/frontend/"
cp -v "$SCRIPT_DIR/files/frontend/nginx.conf"                        "$TARGET/frontend/"
cp -v "$SCRIPT_DIR/files/frontend/.dockerignore"                     "$TARGET/frontend/"

echo ""
echo "==> docker-compose.yml будет перезаписан (в него добавлен сервис frontend)."
echo "    Текущая версия сохранится как docker-compose.yml.bak"
cp -v "$TARGET/docker-compose.yml" "$TARGET/docker-compose.yml.bak"
cp -v "$SCRIPT_DIR/files/docker-compose.yml" "$TARGET/docker-compose.yml"

echo ""
echo "==> Готово. Дальше:"
echo "    cd $TARGET"
echo "    docker compose up -d --build"
echo ""
echo "Фронтенд будет доступен на http://localhost:3000"
echo "(gateway остаётся на 8080, как и раньше)"
