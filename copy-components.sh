#!/bin/bash
# Copy all tournament components from courtsync
SOURCE_DIR="../courtsync/src/components"
DEST_DIR="src/components"

mkdir -p "$DEST_DIR"

# Copy all component files
cp "$SOURCE_DIR/PlayerSelection.tsx" "$DEST_DIR/"
cp "$SOURCE_DIR/TeamSetup.tsx" "$DEST_DIR/"
cp "$SOURCE_DIR/MatchSchedule.tsx" "$DEST_DIR/"
cp "$SOURCE_DIR/Leaderboard.tsx" "$DEST_DIR/"
cp "$SOURCE_DIR/TournamentBracket.tsx" "$DEST_DIR/"
cp "$SOURCE_DIR/TournamentManager.tsx" "$DEST_DIR/"

echo "Components copied successfully!"
