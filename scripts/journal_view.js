export class JournalView extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "journal-view",
        window: { title: "Journal" },
        position: { width: 680, height: 600 },
        resizable: true
    };

    static PARTS = {
        main: {
            template: "modules/foundryvtt-player-journal/templates/entry.html"
        }
    };

    constructor(title, journal, saveFn, options = {}) {
        super(options);
        this.journalTitle = title;
        this.journal = journal;
        this.saveFn = saveFn;
    }

    get title() {
        return this.journalTitle;
    }

    async _prepareContext() {
        return {
            title: this.journalTitle,
            entries: this.journal.entries ?? []
        };
    }

    _onRender(context, options) {
        this.element.querySelector(".new-entry")?.addEventListener("click", () => this._newEntry());
        this.element.querySelectorAll(".edit-entry").forEach(el => {
            el.addEventListener("click", (e) => this._editEntry(e.currentTarget.dataset.entryId));
        });
        this.element.querySelectorAll(".delete-entry").forEach(el => {
            el.addEventListener("click", (e) => this._deleteEntry(e.currentTarget.dataset.entryId));
        });
    }

    async _newEntry() {
        const content = `
            <div class="pj-new-entry">
                <input type="text" id="entry-title" placeholder="Entry title..."/>
                <textarea id="entry-body" rows="6" placeholder="Write your notes here..."></textarea>
                <input type="text" id="entry-tags" placeholder="Tags (comma separated)..."/>
            </div>`;
        new Dialog({
            title: "New Entry",
            content,
            buttons: {
                save: { label: "Save", callback: async (html) => await this._saveNewEntry(html) },
                cancel: { label: "Cancel" }
            }
        }).render(true);
    }

    async _editEntry(entryId) {
        const entry = this.journal.entries.find(e => e.id === entryId);
        if (!entry) return;
        const content = `
            <div class="pj-new-entry">
                <input type="text" id="entry-title" value="${entry.title}"/>
                <textarea id="entry-body" rows="6">${entry.body}</textarea>
                <input type="text" id="entry-tags" value="${entry.tags.join(", ")}"/>
            </div>`;
        new Dialog({
            title: "Edit Entry",
            content,
            buttons: {
                save: {
                    label: "Save",
                    callback: async (html) => {
                        entry.title = html.find("#entry-title").val().trim();
                        entry.body = html.find("#entry-body").val().trim();
                        entry.tags = html.find("#entry-tags").val().split(",").map(t => t.trim()).filter(t => t);
                        await this.saveFn(this.journal);
                        this.render();
                    }
                },
                cancel: { label: "Cancel" }
            }
        }).render(true);
    }

    async _deleteEntry(entryId) {
        this.journal.entries = this.journal.entries.filter(e => e.id !== entryId);
        await this.saveFn(this.journal);
        this.render();
    }

    async _saveNewEntry(html) {
        const title = html.find("#entry-title").val().trim();
        const body = html.find("#entry-body").val().trim();
        const tags = html.find("#entry-tags").val().split(",").map(t => t.trim()).filter(t => t);
        if (!title) return ui.notifications.warn("Entry needs a title.");
        const entry = {
            id: foundry.utils.randomID(),
            title,
            body,
            tags,
            createdBy: game.user.name,
            timestamp: new Date().toLocaleString()
        };
        this.journal.entries.push(entry);
        await this.saveFn(this.journal);
        this.render();
    }
}