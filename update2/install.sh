#!/usr/bin/env bash
# Устанавливает: страницу рейтинга (2) + визуальный апгрейд (3)
# поверх уже установленной геймификации (1).
#
# Использование:
#   ./install.sh /путь/к/твоему/проекту/focusfriends

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$(pwd)}"

if [ ! -d "$TARGET/frontend" ]; then
  echo "Не похоже на корень проекта FocusFriends: $TARGET"
  echo "Укажи путь явно: ./install.sh /путь/к/focusfriends"
  exit 1
fi

echo "==> Копирую новые файлы"
mkdir -p "$TARGET/frontend/src/types"
cp -v "$SCRIPT_DIR/files/frontend/src/components/LeaderboardSection.tsx" "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/api/leaderboardApi.ts"             "$TARGET/frontend/src/api/"
cp -v "$SCRIPT_DIR/files/frontend/src/api/userApi.ts"                    "$TARGET/frontend/src/api/"
cp -v "$SCRIPT_DIR/files/frontend/src/types/leaderboard.ts"              "$TARGET/frontend/src/types/"

echo ""
echo "==> Обновляю изменённые файлы"
cp -v "$SCRIPT_DIR/files/frontend/src/context/GamificationContext.tsx" "$TARGET/frontend/src/context/"
cp -v "$SCRIPT_DIR/files/frontend/src/pages/DashboardPage.tsx"         "$TARGET/frontend/src/pages/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/HabitCard.tsx"        "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/components/TaskSection.tsx"      "$TARGET/frontend/src/components/"
cp -v "$SCRIPT_DIR/files/frontend/src/theme.ts"                        "$TARGET/frontend/src/"
cp -v "$SCRIPT_DIR/files/frontend/src/index.css"                       "$TARGET/frontend/src/"

echo ""
echo "==> Готово. Дальше:"
echo "    cd $TARGET"
echo "    docker compose up -d --build frontend"
echo ""
echo "Обнови http://localhost:3000 (жёсткое обновление Cmd+Shift+R, чтобы сбросить кэш)"
