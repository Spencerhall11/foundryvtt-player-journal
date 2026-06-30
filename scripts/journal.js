import { getPersonalJournal, savePersonalJournal, getPartyJournal, savePartyJournal, getGroupJournal, saveGroupJournal, getCodex, saveCodex } from "./journal_store.js";
import { JournalView } from "./journal_view.js";

export class PlayerJournal extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    static DEFAULT_OPTIONS = {
    id: "player-journal",
    window: { title: "Personal Log" },
    position: { width: 600, height: 500, top: 200, left: 400 },
    resizable: true
    };

    static PARTS = {
        main: {
            template: "modules/foundryvtt-player-journal/templates/journal.html"
        }
    };

    async _prepareContext() {
        const allGroups = game.settings.get("foundryvtt-player-journal", "group-journals");
        const groups = Object.values(allGroups)
            .filter(g => g.members.includes(game.user.id))
            .map(g => ({ id: g.id, name: g.name, memberCount: g.members.length }));
        return { userId: game.user.id, userName: game.user.name, isGM: game.user.isGM, groups };
    }

    _onRender(context, options) {
        this.element.querySelector(".journal-personal")?.addEventListener("click", () => this._openPersonal());
        this.element.querySelector(".journal-party")?.addEventListener("click", () => this._openParty());
        this.element.querySelectorAll(".journal-group").forEach(el => {
            el.addEventListener("click", (e) => this._openGroup(e.currentTarget.dataset.groupId));
        });
        this.element.querySelector(".journal-codex")?.addEventListener("click", () => this._openCodex());
        this.element.querySelector(".create-group")?.addEventListener("click", () => this._createGroup());
    }

    static open() {
        new PlayerJournal().render(true);
    }

    async _createGroup() {
        const otherPlayers = game.users
            .filter(u => !u.isGM && u.id !== game.user.id)
            .map(u => `<label><input type="checkbox" value="${u.id}"> ${u.name}</label>`)
            .join("");
        const content = `
            <div class="pj-create-group">
                <label>Group Name</label>
                <input type="text" id="group-name" placeholder="Enter group name..."/>
                <label>Invite Members</label>
                <div class="pj-member-list">${otherPlayers}</div>
            </div>`;
        new Dialog({
            title: "Create Group",
            content,
            buttons: {
                create: { label: "Create", callback: async (html) => await this._saveNewGroup(html) },
                cancel: { label: "Cancel" }
            }
        }).render(true);
    }

    async _saveNewGroup(html) {
        const name = html.find("#group-name").val().trim();
        if (!name) return ui.notifications.warn("Group needs a name.");
        const members = [];
        html.find(".pj-member-list input:checked").each((i, el) => members.push(el.value));
        members.push(game.user.id);
        const id = foundry.utils.randomID();
        const group = { id, name, createdBy: game.user.id, members };
        const allGroups = game.settings.get("foundryvtt-player-journal", "group-journals");
        allGroups[id] = group;
        await game.settings.set("foundryvtt-player-journal", "group-journals", allGroups);
        this.render();
    }

    _openPersonal() {
        const journal = getPersonalJournal();
        new JournalView("Personal Journal", journal, savePersonalJournal).render(true);
    }

    _openParty() {
        const journal = getPartyJournal();
        new JournalView("Party Journal", journal, savePartyJournal).render(true);
    }

    _openGroup(groupId) {
        const journal = getGroupJournal(groupId);
        new JournalView("Group Journal", journal, (j) => saveGroupJournal(groupId, j)).render(true);
    }

    _openCodex() {
        const codex = getCodex();
        new JournalView("Codex", codex, saveCodex).render(true);
    }
}