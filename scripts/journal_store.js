
export function getPersonalJournal(){
    
    const all = game.settings.get("foundryvtt-player-journal", "personal-journals");
    
    return all[game.user.id] ?? { entries: [] };
}

export async function savePersonalJournal(journal){
    const all = game.settings.get("foundryvtt-player-journal", "personal-journals");
    
    all[game.user.id] = journal;
    
    await game.settings.set("foundryvtt-player-journal", "personal-journals", all);
}

export function getPartyJournal() {
    const all = game.settings.get("foundryvtt-player-journal", "party-journals");
    return { entries: Array.isArray(all.entries) ? all.entries : [] };
}

export async function savePartyJournal(journal) {
    const data = { entries: journal.entries ?? [] };
    await game.settings.set("foundryvtt-player-journal", "party-journals", data);
}

export function getGroupJournal(groupId) {

    const all = game.settings.get("foundryvtt-player-journal", "group-journals");

    return all[groupId] ?? { entries: [] };
}

export async function saveGroupJournal(groupId, journal) {

    const all = game.settings.get("foundryvtt-player-journal", "group-journals");

    all[groupId] = journal;

    await game.settings.set("foundryvtt-player-journal", "group-journals", all);
}

export function getCodex() {

    const all = game.settings.get("foundryvtt-player-journal", "player-codex");

    return all[game.user.id] ?? { items: [], bestiary: [] };

}

export async function saveCodex(codex) {

    const all = game.settings.get("foundryvtt-player-journal", "player-codex");

    all[game.user.id] = codex;

    await game.settings.set("foundryvtt-player-journal", "player-codex", all);
    
}