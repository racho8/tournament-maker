# Badminton Tournament Maker

A comprehensive doubles badminton tournament management application with round-robin group stage and knockout playoffs.

## Features

- 🎾 **Player Management**: Add and manage players with skill levels
- 👥 **Team Generation**: Random or balanced team creation
- 🔄 **Round-Robin Group Stage**: All teams compete against each other
- 🏆 **Knockout Playoffs**: Top teams advance to semi-finals and finals
- 📊 **Live Leaderboard**: Real-time standings with detailed statistics
- 🌳 **Visual Bracket**: Tournament tree visualization showing progression
- 💾 **Data Persistence**: Tournament state saved in browser localStorage
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Deploy to GitHub Pages

```bash
npm run deploy
```

Deploys the application to GitHub Pages.

## How to Use

1. **Add Players**: Enter player names and optionally set skill levels
2. **Create Tournament**: Choose random or balanced team generation
3. **Configure Teams**: Lock teams or swap players as needed
4. **Start Tournament**: System generates all round-robin matches
5. **Enter Scores**: Record match results as games are played
6. **View Progress**: Check leaderboard and bracket visualization
7. **Knockout Stage**: Top 4 teams automatically advance to playoffs
8. **Crown Champion**: Complete semi-finals, finals, and 3rd place match

## Tournament Format

### Group Stage
- Round-robin format where every team plays every other team
- Points system: 3 points for win, 1 point for tie, 0 for loss
- Teams ranked by: Points → Win% → Point Differential

### Knockout Stage
- **5+ Teams**: Top 4 teams play semi-finals (#1 vs #4, #2 vs #3)
- **4 Teams**: Top 2 teams play directly in finals (no semi-finals)
- Championship final between semi-final winners
- 3rd place match between semi-final losers

## Technologies

- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Local Storage for data persistence

## License

MIT
