export const formationRemaining = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `{m}:${s.toString().padStart(2, '0')}`;
}